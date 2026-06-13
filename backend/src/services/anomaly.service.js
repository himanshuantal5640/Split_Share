import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { ANOMALY_TYPES } from '../constants/anomalyTypes.js';

/**
 * Normalizes case-insensitive lookups for CSV row object keys.
 */
const getVal = (row, possibleKeys) => {
  if (!row) return undefined;
  const keys = Object.keys(row);
  for (const key of keys) {
    const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (possibleKeys.includes(normalizedKey)) {
      return row[key];
    }
  }
  return undefined;
};

/**
 * Helper to parse percentages or shares from a split detail string.
 * Example detail string: "Aisha 30%; Rohan 30%; Priya 30%; Meera 20%" -> [30, 30, 30, 20]
 */
const parseSplitNumbers = (detailStr) => {
  if (!detailStr || typeof detailStr !== 'string') return [];
  const parts = detailStr.split(/[;,]/);
  const numbers = [];
  for (const part of parts) {
    const match = part.match(/\d+(\.\d+)?/);
    if (match) {
      numbers.push(parseFloat(match[0]));
    }
  }
  return numbers;
};

/**
 * Runs the 12 detectors on a single import row.
 * Returns an array of anomaly definitions to be inserted.
 */
const runDetectors = (row, index, group, allUsers, groupMemberships, siblingRows, existingExpenses) => {
  const anomalies = [];

  // 1. Extract values using key normalizer
  const dateStr = getVal(row, ['date', 'transactiondate', 'transaction_date', 'time']);
  const descStr = getVal(row, ['description', 'desc', 'title', 'item']);
  const payerStr = getVal(row, ['payer', 'paidby', 'paidbyid', 'paid_by']);
  const amountStr = getVal(row, ['amount', 'sum', 'total', 'cost']);
  const currencyStr = getVal(row, ['currency', 'curr']);
  const splitTypeStr = getVal(row, ['splittype', 'split_type']);
  const splitDetailStr = getVal(row, ['splitdetail', 'split_detail', 'splits']);
  const splitWithStr = getVal(row, ['splitwith', 'split_with']);

  const parsedAmount = parseFloat(amountStr);
  const hasValidAmount = !isNaN(parsedAmount);

  // 8. INVALID_AMOUNT detector
  if (amountStr === undefined || amountStr === null || amountStr.toString().trim() === '' || isNaN(parsedAmount)) {
    anomalies.push({
      type: 'INVALID_AMOUNT',
      severity: ANOMALY_TYPES.INVALID_AMOUNT.severity,
      description: `Row #${index + 1}: Amount is missing or is not a valid number.`
    });
  }

  // 9. NEGATIVE_AMOUNT detector
  if (hasValidAmount && parsedAmount <= 0) {
    anomalies.push({
      type: 'NEGATIVE_AMOUNT',
      severity: ANOMALY_TYPES.NEGATIVE_AMOUNT.severity,
      description: `Row #${index + 1}: The transaction amount (${parsedAmount}) must be positive.`
    });
  }

  // 12. PRECISION_ANOMALY detector
  if (amountStr !== undefined && amountStr !== null) {
    const str = amountStr.toString().trim();
    const dotIndex = str.indexOf('.');
    if (dotIndex !== -1 && str.substring(dotIndex + 1).length > 2) {
      anomalies.push({
        type: 'PRECISION_ANOMALY',
        severity: ANOMALY_TYPES.PRECISION_ANOMALY.severity,
        description: `Row #${index + 1}: Amount '${str}' has more than 2 decimal places.`
      });
    }
  }

  // 2. MISSING_PAYER detector
  const trimmedPayer = payerStr ? payerStr.toString().trim() : '';
  if (!trimmedPayer) {
    anomalies.push({
      type: 'MISSING_PAYER',
      severity: ANOMALY_TYPES.MISSING_PAYER.severity,
      description: `Row #${index + 1}: The payer field is empty.`
    });
  }

  // Resolve payer User from database (by case-insensitive name, email, or ID)
  let payerUser = null;
  if (trimmedPayer) {
    payerUser = allUsers.find(u => {
      const uId = parseInt(trimmedPayer, 10);
      return (
        u.name.toLowerCase() === trimmedPayer.toLowerCase() ||
        u.email.toLowerCase() === trimmedPayer.toLowerCase() ||
        (!isNaN(uId) && u.id === uId)
      );
    });

    // 3. UNKNOWN_MEMBER detector
    if (!payerUser) {
      anomalies.push({
        type: 'UNKNOWN_MEMBER',
        severity: ANOMALY_TYPES.UNKNOWN_MEMBER.severity,
        description: `Row #${index + 1}: Payer '${trimmedPayer}' is not registered in the database.`
      });
    }
  }

  // Resolve payer membership details
  let membership = null;
  if (payerUser) {
    membership = groupMemberships.find(m => m.userId === payerUser.id);

    // 4. MEMBERSHIP_CONFLICT detector
    if (!membership) {
      anomalies.push({
        type: 'MEMBERSHIP_CONFLICT',
        severity: ANOMALY_TYPES.MEMBERSHIP_CONFLICT.severity,
        description: `Row #${index + 1}: Payer '${payerUser.name}' is registered but has never joined the group '${group.name}'.`
      });
    }
  }

  // Validate dates and ex-member constraints
  let parsedDate = null;
  if (dateStr) {
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) {
      parsedDate = new Date(timestamp);
    }
  }

  if (payerUser && membership && parsedDate) {
    // 5. EX_MEMBER_EXPENSE detector
    if (membership.status === 'LEFT' && membership.leftAt) {
      const checkTime = parsedDate.getTime();
      const leftTime = new Date(membership.leftAt).getTime();
      if (checkTime > leftTime) {
        anomalies.push({
          type: 'EX_MEMBER_EXPENSE',
          severity: ANOMALY_TYPES.EX_MEMBER_EXPENSE.severity,
          description: `Row #${index + 1}: Payer '${payerUser.name}' had already left the group on the transaction date (${parsedDate.toISOString().split('T')[0]}).`
        });
      }
    }
  }

  // 6. SETTLEMENT_AS_EXPENSE detector
  const trimmedDesc = descStr ? descStr.toString().toLowerCase() : '';
  const settlementKeywords = ['settlement', 'settle', 'paid back', 'refund', 'repay', 'payment'];
  const hasSettlementKeyword = settlementKeywords.some(keyword => trimmedDesc.includes(keyword));

  // Also check if split has only 1 participant who matches the payer (meaning resolving individual balance)
  const participants = splitWithStr ? splitWithStr.split(/[;,]/).map(p => p.trim().toLowerCase()) : [];
  const onlyPayerInSplit = participants.length === 1 && trimmedPayer && participants[0] === trimmedPayer.toLowerCase();

  if (hasSettlementKeyword || onlyPayerInSplit) {
    anomalies.push({
      type: 'SETTLEMENT_AS_EXPENSE',
      severity: ANOMALY_TYPES.SETTLEMENT_AS_EXPENSE.severity,
      description: `Row #${index + 1}: Description or split structure suggests this is actually a settlement ('${descStr}').`
    });
  }

  // 7. CURRENCY_MISMATCH detector
  if (currencyStr) {
    const cleanCurrency = currencyStr.toString().trim().toUpperCase();
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];
    // Assuming default group currency is USD unless specified
    if (!validCurrencies.includes(cleanCurrency) || cleanCurrency !== 'USD') {
      anomalies.push({
        type: 'CURRENCY_MISMATCH',
        severity: ANOMALY_TYPES.CURRENCY_MISMATCH.severity,
        description: `Row #${index + 1}: Currency '${cleanCurrency}' differs from the default group currency (USD).`
      });
    }
  }

  // 10. INVALID_PERCENTAGE_SPLIT detector
  const cleanSplitType = splitTypeStr ? splitTypeStr.toString().trim().toUpperCase() : 'EQUAL';
  if (cleanSplitType === 'PERCENTAGE') {
    const percentages = parseSplitNumbers(splitDetailStr);
    if (percentages.length > 0) {
      const sumPct = percentages.reduce((a, b) => a + b, 0);
      // Allowing small floating point variance
      if (Math.abs(sumPct - 100) > 0.01) {
        anomalies.push({
          type: 'INVALID_PERCENTAGE_SPLIT',
          severity: ANOMALY_TYPES.INVALID_PERCENTAGE_SPLIT.severity,
          description: `Row #${index + 1}: Percentage split sums to ${sumPct}%, expected exactly 100%.`
        });
      }
    }
  }

  // 11. UNEQUAL_SPLIT_MISMATCH detector
  if ((cleanSplitType === 'UNEQUAL' || cleanSplitType === 'SHARE') && hasValidAmount) {
    const shares = parseSplitNumbers(splitDetailStr);
    if (shares.length > 0) {
      const sumShares = shares.reduce((a, b) => a + b, 0);
      if (Math.abs(sumShares - parsedAmount) > 0.01) {
        anomalies.push({
          type: 'UNEQUAL_SPLIT_MISMATCH',
          severity: ANOMALY_TYPES.UNEQUAL_SPLIT_MISMATCH.severity,
          description: `Row #${index + 1}: Split shares sum to ${sumShares}, which does not match the total amount of ${parsedAmount}.`
        });
      }
    }
  }

  // 1. DUPLICATE_EXPENSE detector
  if (descStr && hasValidAmount && payerUser && parsedDate) {
    // Check siblings in the same CSV file
    const duplicateInSiblings = siblingRows.some((sib, sibIdx) => {
      if (sibIdx === index) return false;
      const sDateStr = getVal(sib, ['date', 'transactiondate', 'transaction_date', 'time']);
      const sDescStr = getVal(sib, ['description', 'desc', 'title', 'item']);
      const sPayerStr = getVal(sib, ['payer', 'paidby', 'paidbyid', 'paid_by']);
      const sAmountStr = getVal(sib, ['amount', 'sum', 'total', 'cost']);

      const sAmt = parseFloat(sAmountStr);
      const sDateTimestamp = sDateStr ? Date.parse(sDateStr) : NaN;

      const descMatch = sDescStr && sDescStr.toString().trim().toLowerCase() === descStr.toString().trim().toLowerCase();
      const amtMatch = !isNaN(sAmt) && sAmt === parsedAmount;
      const payerMatch = sPayerStr && sPayerStr.toString().trim().toLowerCase() === trimmedPayer.toLowerCase();
      const dateMatch = !isNaN(sDateTimestamp) && new Date(sDateTimestamp).getTime() === parsedDate.getTime();

      return descMatch && amtMatch && payerMatch && dateMatch && sibIdx < index; // only flag the later one as duplicate
    });

    // Check existing expenses in DB
    const duplicateInDb = existingExpenses.some(exp => {
      const descMatch = exp.description.trim().toLowerCase() === descStr.toString().trim().toLowerCase();
      const amtMatch = new Prisma.Decimal(exp.amount).equals(new Prisma.Decimal(parsedAmount));
      const payerMatch = exp.paidById === payerUser.id;
      const dateMatch = new Date(exp.transactionDate).getTime() === parsedDate.getTime();

      return descMatch && amtMatch && payerMatch && dateMatch;
    });

    if (duplicateInSiblings || duplicateInDb) {
      anomalies.push({
        type: 'DUPLICATE_EXPENSE',
        severity: ANOMALY_TYPES.DUPLICATE_EXPENSE.severity,
        description: `Row #${index + 1}: Duplicate transaction detected for description '${descStr}' on date ${dateStr}.`
      });
    }
  }

  return anomalies;
};

/**
 * Analyzes all rows of a CSV import and registers anomalies.
 * @param {number} importId - The import ID
 * @param {number} userId - The user triggering the analysis
 * @returns {object} Analysis report object
 */
export const analyzeImport = async (importId, userId) => {
  // 1. Fetch import details
  const importRecord = await prisma.import.findUnique({
    where: { id: importId },
    include: {
      rows: {
        orderBy: {
          rowNumber: 'asc'
        }
      }
    }
  });

  if (!importRecord) {
    throw new AppError('Import record not found.', 404);
  }

  const groupId = importRecord.groupId;

  // 2. Authorize: user must be active member of group
  const userMembership = await prisma.groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  if (!userMembership || userMembership.status !== 'ACTIVE') {
    throw new AppError('Access denied. You are not an active member of this group.', 403);
  }

  // 3. Load cache data for validation speed
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  const allUsers = await prisma.user.findMany();
  const groupMemberships = await prisma.groupMembership.findMany({
    where: { groupId }
  });
  const existingExpenses = await prisma.expense.findMany({
    where: { groupId, isDeleted: false }
  });

  // 4. Delete old anomalies for this import's rows to allow re-analysis
  const rowIds = importRecord.rows.map(r => r.id);
  if (rowIds.length > 0) {
    await prisma.anomaly.deleteMany({
      where: {
        importRowId: {
          in: rowIds
        }
      }
    });
  }

  // 5. Run detectors on each row
  const anomaliesToCreate = [];
  const parsedSiblingRows = importRecord.rows.map(r => {
    try {
      return JSON.parse(r.rawContent);
    } catch (err) {
      return {};
    }
  });

  importRecord.rows.forEach((rowRecord, index) => {
    const rawContent = parsedSiblingRows[index];
    const findings = runDetectors(
      rawContent,
      index,
      group,
      allUsers,
      groupMemberships,
      parsedSiblingRows,
      existingExpenses
    );

    findings.forEach(f => {
      anomaliesToCreate.push({
        importRowId: rowRecord.id,
        groupId,
        type: f.type,
        severity: f.severity,
        description: f.description,
        status: 'PENDING'
      });
    });
  });

  // 6. Store findings
  if (anomaliesToCreate.length > 0) {
    await prisma.anomaly.createMany({
      data: anomaliesToCreate
    });
  }

  // 7. Compile detection report statistics
  const totalDetected = anomaliesToCreate.length;
  const severityCounts = {
    LOW: anomaliesToCreate.filter(a => a.severity === 'LOW').length,
    MEDIUM: anomaliesToCreate.filter(a => a.severity === 'MEDIUM').length,
    HIGH: anomaliesToCreate.filter(a => a.severity === 'HIGH').length,
    CRITICAL: anomaliesToCreate.filter(a => a.severity === 'CRITICAL').length
  };

  return {
    importId,
    groupId,
    status: 'ANALYZED',
    totalAnomaliesDetected: totalDetected,
    severities: severityCounts,
    anomalies: anomaliesToCreate.map(a => ({
      type: a.type,
      severity: a.severity,
      description: a.description,
      suggestedAction: ANOMALY_TYPES[a.type].suggestedAction
    }))
  };
};

/**
 * Retrieves all anomalies logged for a specific import.
 * @param {number} importId - The import ID
 * @param {number} userId - The user ID
 * @returns {Array} List of anomalies
 */
export const getImportAnomalies = async (importId, userId) => {
  // Verify import existence
  const importRecord = await prisma.import.findUnique({
    where: { id: importId }
  });
  if (!importRecord) {
    throw new AppError('Import record not found.', 404);
  }

  // Verify group membership
  const userMembership = await prisma.groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId: importRecord.groupId,
        userId
      }
    }
  });

  if (!userMembership || userMembership.status !== 'ACTIVE') {
    throw new AppError('Access denied. You must be an active member of this group.', 403);
  }

  const anomalies = await prisma.anomaly.findMany({
    where: {
      importRow: {
        importId
      }
    },
    include: {
      importRow: true
    },
    orderBy: {
      id: 'asc'
    }
  });

  return anomalies.map(a => ({
    id: a.id,
    importRowId: a.importRowId,
    rowNumber: a.importRow.rowNumber,
    type: a.type,
    severity: a.severity,
    description: a.description,
    status: a.status,
    suggestedAction: ANOMALY_TYPES[a.type].suggestedAction,
    createdAt: a.createdAt
  }));
};

/**
 * Retrieves single anomaly detail.
 * @param {number} anomalyId - The anomaly ID
 * @param {number} userId - The user ID
 * @returns {object} Anomaly details
 */
export const getAnomalyDetails = async (anomalyId, userId) => {
  const anomaly = await prisma.anomaly.findUnique({
    where: { id: anomalyId },
    include: {
      importRow: true
    }
  });

  if (!anomaly) {
    throw new AppError('Anomaly record not found.', 404);
  }

  // Verify group membership
  const userMembership = await prisma.groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId: anomaly.groupId,
        userId
      }
    }
  });

  if (!userMembership || userMembership.status !== 'ACTIVE') {
    throw new AppError('Access denied. You must be an active member of this group.', 403);
  }

  return {
    id: anomaly.id,
    groupId: anomaly.groupId,
    expenseId: anomaly.expenseId,
    importRowId: anomaly.importRowId,
    rowNumber: anomaly.importRow ? anomaly.importRow.rowNumber : null,
    type: anomaly.type,
    severity: anomaly.severity,
    description: anomaly.description,
    status: anomaly.status,
    suggestedAction: ANOMALY_TYPES[anomaly.type].suggestedAction,
    createdAt: anomaly.createdAt,
    updatedAt: anomaly.updatedAt
  };
};

export default {
  analyzeImport,
  getImportAnomalies,
  getAnomalyDetails
};
