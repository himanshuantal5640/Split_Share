import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';
import * as expenseService from './expense.service.js';
import * as settlementService from './settlement.service.js';

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
 * Resolves a user profile by matching name, email, or ID.
 */
const resolveUser = (identifier, allUsers) => {
  if (!identifier) return null;
  const cleanStr = identifier.toString().trim().toLowerCase();
  if (!cleanStr) return null;

  return allUsers.find((u) => {
    const uId = parseInt(cleanStr, 10);
    return (
      u.name.toLowerCase() === cleanStr ||
      u.email.toLowerCase() === cleanStr ||
      (!isNaN(uId) && u.id === uId)
    );
  });
};

/**
 * Processes all approved rows of an analyzed CSV import and generates corresponding expenses/settlements.
 * @param {number} importId - The import ID
 * @param {number} userId - The ID of the user triggering the processing
 * @returns {Promise<object>} Processing report summary
 */
export const processImport = async (importId, userId) => {
  // 1. Fetch import details with rows and their anomalies
  const importRecord = await prisma.import.findUnique({
    where: { id: importId },
    include: {
      rows: {
        include: {
          anomalies: true,
          expense: true,
          settlement: true
        },
        orderBy: { rowNumber: 'asc' }
      }
    }
  });

  if (!importRecord) {
    throw new AppError('Import record not found.', 404);
  }

  const groupId = importRecord.groupId;

  // 2. Authorize user: must be an active group member
  const userMembership = await prisma.groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  if (!userMembership || userMembership.status !== 'ACTIVE') {
    throw new AppError('Access denied. You must be an active member of this group.', 403);
  }

  // 3. Prevent duplicate processing
  if (importRecord.status === 'FAILED') {
    throw new AppError('Import parsing previously failed and cannot be processed.', 400);
  }

  const eligibleRows = importRecord.rows.filter(r => r.isValid);
  const processedRows = eligibleRows.filter(r => r.expense || r.settlement);

  if (eligibleRows.length > 0 && processedRows.length === eligibleRows.length) {
    throw new AppError('Import has already been processed successfully. Duplicate processing is blocked.', 400);
  }

  // Update import status to PROCESSING immediately to prevent concurrent triggers
  await prisma.import.update({
    where: { id: importId },
    data: { status: 'PROCESSING' }
  });

  // 4. Load cache data for fast resolution
  const allUsers = await prisma.user.findMany();
  const activeMembers = await prisma.groupMembership.findMany({
    where: { groupId, status: 'ACTIVE' },
    include: { user: true }
  });

  const processedExpenses = [];
  const processedSettlements = [];
  const skippedRows = [];
  const rejectedRows = [];

  // 5. Process each row
  for (const row of importRecord.rows) {
    // Check if already processed
    if (row.expense || row.settlement) {
      skippedRows.push({
        rowNumber: row.rowNumber,
        reason: 'Row has already been processed previously.'
      });
      continue;
    }

    // Check validation status from parsing stage
    if (!row.isValid) {
      rejectedRows.push({
        rowNumber: row.rowNumber,
        reason: `Row failed initial CSV parser validation: ${row.validationErrors || 'Unknown validation errors.'}`
      });
      continue;
    }

    // Check anomaly statuses
    const hasPending = row.anomalies.some((a) => a.status === 'PENDING' || a.status === 'UNRESOLVED');
    const hasRejected = row.anomalies.some((a) => a.status === 'REJECTED');

    if (hasRejected) {
      rejectedRows.push({
        rowNumber: row.rowNumber,
        reason: 'Row processing blocked because one or more associated anomalies were REJECTED.'
      });
      continue;
    }

    if (hasPending) {
      skippedRows.push({
        rowNumber: row.rowNumber,
        reason: 'Row skipped due to unresolved pending anomalies. Please approve or dismiss anomalies first.'
      });
      continue;
    }

    // Process approved/anomaly-free row
    let rawContent;
    try {
      rawContent = JSON.parse(row.rawContent);
    } catch (err) {
      rejectedRows.push({
        rowNumber: row.rowNumber,
        reason: 'Row raw content is not valid JSON.'
      });
      continue;
    }

    const descStr = getVal(rawContent, ['description', 'desc', 'title', 'item']) || '';
    const amountStr = getVal(rawContent, ['amount', 'sum', 'total', 'cost']);
    const category = getVal(rawContent, ['category', 'cat', 'type']) || 'General';
    const payerStr = getVal(rawContent, ['payer', 'paidby', 'paidbyid', 'paid_by']);
    const dateStr = getVal(rawContent, ['date', 'transactiondate', 'transaction_date', 'time']);
    const currency = getVal(rawContent, ['currency', 'curr']) || 'USD';

    const amount = parseFloat(amountStr);
    const date = dateStr ? new Date(dateStr) : new Date();

    // Resolve payer
    const payerUser = resolveUser(payerStr, allUsers);
    if (!payerUser) {
      rejectedRows.push({
        rowNumber: row.rowNumber,
        reason: `Could not resolve payer from identifier '${payerStr}'.`
      });
      continue;
    }

    // Identify if row is a settlement
    const trimmedDesc = descStr.toString().toLowerCase();
    const settlementKeywords = ['settlement', 'settle', 'paid back', 'refund', 'repay', 'payment'];
    const isSettlement = settlementKeywords.some((keyword) => trimmedDesc.includes(keyword));

    if (isSettlement) {
      // Resolve receiver (payee)
      const receiverStr = getVal(rawContent, ['receiver', 'payee', 'payeeid', 'receiverid', 'splitwith', 'split_with', 'splitdetail', 'split_detail']);
      
      let cleanReceiverIdentifier = '';
      if (receiverStr) {
        // Strip percentages or numbers, e.g. "Charlie 100%" -> "Charlie"
        const match = receiverStr.toString().trim().split(/[ \t%:\d;]/)[0];
        cleanReceiverIdentifier = match ? match.trim() : '';
      }

      const receiverUser = resolveUser(cleanReceiverIdentifier, allUsers);
      if (!receiverUser) {
        rejectedRows.push({
          rowNumber: row.rowNumber,
          reason: `Could not resolve settlement receiver/payee from identifier '${receiverStr}'.`
        });
        continue;
      }

      try {
        const settlement = await settlementService.createSettlement({
          groupId,
          payerId: payerUser.id,
          receiverId: receiverUser.id,
          amount,
          transactionDate: date,
          currency,
          importId,
          importRowId: row.id
        });

        processedSettlements.push({
          rowNumber: row.rowNumber,
          settlementId: settlement.id,
          payer: payerUser.name,
          payee: receiverUser.name,
          amount,
          currency,
          normalizedAmount: parseFloat(settlement.normalizedAmount.toString())
        });
      } catch (err) {
        rejectedRows.push({
          rowNumber: row.rowNumber,
          reason: `Failed to create settlement: ${err.message}`
        });
      }
    } else {
      // Process as Expense
      const splitTypeStr = (getVal(rawContent, ['splittype', 'split_type']) || 'EQUAL').toUpperCase();
      const splitDetail = getVal(rawContent, ['splitdetail', 'split_detail', 'splits']);
      const splitWith = getVal(rawContent, ['splitwith', 'split_with']);

      let participantIdentifiers = [];
      if (splitWith) {
        participantIdentifiers = splitWith.split(/[;,]/).map((p) => p.trim());
      } else if (splitDetail) {
        // "Aisha 30%; Bob 70%" -> extract "Aisha", "Bob"
        participantIdentifiers = splitDetail
          .split(/[;,]/)
          .map((part) => {
            const match = part.trim().match(/^([A-Za-z0-9_.-]+)/);
            return match ? match[1] : '';
          })
          .filter(Boolean);
      }

      let resolvedParticipants = [];
      if (participantIdentifiers.length > 0) {
        participantIdentifiers.forEach((ident) => {
          const u = resolveUser(ident, allUsers);
          if (u) {
            resolvedParticipants.push(u);
          }
        });
      }

      // Default to all active group members if no participants resolved
      if (resolvedParticipants.length === 0) {
        resolvedParticipants = activeMembers.map((m) => m.user);
      }

      // Construct splits structure
      let splits = [];
      if (splitTypeStr === 'PERCENTAGE') {
        if (splitDetail) {
          const parts = splitDetail.split(/[;,]/);
          parts.forEach((part) => {
            const numMatch = part.match(/\d+(\.\d+)?/);
            const nameMatch = part.trim().match(/^([A-Za-z0-9_.-]+)/);
            if (numMatch && nameMatch) {
              const u = resolvedParticipants.find(
                (p) => p.name.toLowerCase() === nameMatch[1].toLowerCase() || p.email.toLowerCase() === nameMatch[1].toLowerCase() || p.id.toString() === nameMatch[1]
              );
              if (u) {
                splits.push({
                  userId: u.id,
                  percentage: parseFloat(numMatch[0])
                });
              }
            }
          });
        }
      } else if (splitTypeStr === 'UNEQUAL' || splitTypeStr === 'SHARE') {
        if (splitDetail) {
          const parts = splitDetail.split(/[;,]/);
          parts.forEach((part) => {
            const numMatch = part.match(/\d+(\.\d+)?/);
            const nameMatch = part.trim().match(/^([A-Za-z0-9_.-]+)/);
            if (numMatch && nameMatch) {
              const u = resolvedParticipants.find(
                (p) => p.name.toLowerCase() === nameMatch[1].toLowerCase() || p.email.toLowerCase() === nameMatch[1].toLowerCase() || p.id.toString() === nameMatch[1]
              );
              if (u) {
                splits.push({
                  userId: u.id,
                  share: parseFloat(numMatch[0])
                });
              }
            }
          });
        }
      } else {
        // EQUAL split
        splits = resolvedParticipants.map((u) => ({
          userId: u.id
        }));
      }

      try {
        const expense = await expenseService.createExpense({
          groupId,
          amount,
          description: descStr,
          category,
          splitType: splitTypeStr === 'SHARE' ? 'UNEQUAL' : splitTypeStr,
          paidById: payerUser.id,
          splits,
          transactionDate: date,
          currency,
          importId,
          importRowId: row.id
        });

        processedExpenses.push({
          rowNumber: row.rowNumber,
          expenseId: expense.id,
          description: descStr,
          payer: payerUser.name,
          amount,
          currency,
          normalizedAmount: parseFloat(expense.normalizedAmount.toString())
        });
      } catch (err) {
        rejectedRows.push({
          rowNumber: row.rowNumber,
          reason: `Failed to create expense: ${err.message}`
        });
      }
    }
  }

  // 6. Finalize import status in DB
  const failedTotal = rejectedRows.length;
  // If some rows were successfully processed, mark as COMPLETED, otherwise leave as COMPLETED but failed counts will show
  await prisma.import.update({
    where: { id: importId },
    data: { status: 'COMPLETED' }
  });

  return {
    importId,
    status: 'COMPLETED',
    statistics: {
      totalRowsProcessed: processedExpenses.length + processedSettlements.length,
      expensesGeneratedCount: processedExpenses.length,
      settlementsGeneratedCount: processedSettlements.length,
      skippedRowsCount: skippedRows.length,
      rejectedRowsCount: rejectedRows.length
    },
    processedExpenses,
    processedSettlements,
    skippedRows,
    rejectedRows
  };
};

/**
 * Gets the current processing status of an import.
 * @param {number} importId - The import ID
 * @param {number} userId - The user ID for membership checks
 * @returns {Promise<object>} Status report
 */
export const getImportStatus = async (importId, userId) => {
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

  return {
    importId,
    status: importRecord.status,
    totalRows: importRecord.totalRows,
    createdAt: importRecord.createdAt,
    updatedAt: importRecord.updatedAt
  };
};

/**
 * Compiles a detailed processing report for the import.
 * @param {number} importId - The import ID
 * @param {number} userId - The user ID
 * @returns {Promise<object>} Detailed report containing generated entities and anomalies status
 */
export const getProcessingReport = async (importId, userId) => {
  const importRecord = await prisma.import.findUnique({
    where: { id: importId },
    include: {
      rows: {
        include: {
          expense: true,
          settlement: {
            include: {
              payer: { select: { name: true } },
              payee: { select: { name: true } }
            }
          },
          anomalies: true
        },
        orderBy: { rowNumber: 'asc' }
      }
    }
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

  const expenses = [];
  const settlements = [];
  const skipped = [];
  const rejected = [];

  importRecord.rows.forEach((row) => {
    if (row.expense) {
      expenses.push({
        rowNumber: row.rowNumber,
        expenseId: row.expense.id,
        description: row.expense.description,
        amount: parseFloat(row.expense.amount.toString()),
        currency: row.expense.currency,
        normalizedAmount: parseFloat(row.expense.normalizedAmount.toString())
      });
    } else if (row.settlement) {
      settlements.push({
        rowNumber: row.rowNumber,
        settlementId: row.settlement.id,
        payer: row.settlement.payer.name,
        payee: row.settlement.payee.name,
        amount: parseFloat(row.settlement.amount.toString()),
        currency: row.settlement.currency,
        normalizedAmount: parseFloat(row.settlement.normalizedAmount.toString())
      });
    } else if (!row.isValid) {
      rejected.push({
        rowNumber: row.rowNumber,
        reason: `Row failed initial parser validation: ${row.validationErrors || 'Unknown validation errors.'}`
      });
    } else {
      // Check anomalies
      const hasPending = row.anomalies.some((a) => a.status === 'PENDING' || a.status === 'UNRESOLVED');
      const hasRejected = row.anomalies.some((a) => a.status === 'REJECTED');

      if (hasRejected) {
        rejected.push({
          rowNumber: row.rowNumber,
          reason: 'Row processing blocked because one or more associated anomalies were REJECTED.'
        });
      } else if (hasPending) {
        skipped.push({
          rowNumber: row.rowNumber,
          reason: 'Row skipped due to unresolved pending anomalies.'
        });
      } else {
        skipped.push({
          rowNumber: row.rowNumber,
          reason: 'Row not processed.'
        });
      }
    }
  });

  return {
    importId,
    status: importRecord.status,
    statistics: {
      totalRows: importRecord.totalRows,
      expensesGeneratedCount: expenses.length,
      settlementsGeneratedCount: settlements.length,
      skippedRowsCount: skipped.length,
      rejectedRowsCount: rejected.length
    },
    expenses,
    settlements,
    skipped,
    rejected
  };
};

export default {
  processImport,
  getImportStatus,
  getProcessingReport
};
