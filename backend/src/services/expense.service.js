import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { getEffectiveRate } from './exchangeRate.service.js';

/**
 * Validates whether a user was an active member of a group on a specific date.
 * @param {number} groupId - The group ID
 * @param {number} userId - The user ID
 * @param {Date} date - The transaction date
 */
const validateMemberOnDate = async (groupId, userId, date) => {
  const membership = await prisma.groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  if (!membership) {
    throw new AppError(`User ${userId} is not a member of this group.`, 400);
  }

  try {
    const txStr = new Date(date).toISOString().split('T')[0];
    const joinStr = new Date(membership.joinedAt).toISOString().split('T')[0];

    if (txStr < joinStr) {
      throw new AppError(`User ${userId} had not joined the group yet on the expense date.`, 400);
    }

    if (membership.status === 'LEFT' && membership.leftAt) {
      const leaveStr = new Date(membership.leftAt).toISOString().split('T')[0];
      if (txStr > leaveStr) {
        throw new AppError(`User ${userId} had already left the group on the expense date.`, 400);
      }
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error('Error validating membership date:', err);
  }
};

/**
 * Computes split amounts based on split type, correcting rounding differences.
 * @param {Prisma.Decimal} totalAmount - Total expense amount
 * @param {string} splitType - EQUAL, UNEQUAL, or PERCENTAGE
 * @param {Array} splits - User split inputs
 * @returns {Array} List of calculated splits with Decimal amounts
 */
const calculateSplits = (totalAmount, splitType, splits) => {
  const numSplits = splits.length;
  let computedSplits = [];
  let sum = new Prisma.Decimal(0);

  if (splitType === 'EQUAL') {
    // Divide amount equally
    const baseShare = totalAmount.div(numSplits).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
    
    // Assign base share to everyone
    computedSplits = splits.map((s) => {
      const amt = baseShare;
      sum = sum.add(amt);
      return {
        userId: s.userId,
        amount: amt,
        percentage: new Prisma.Decimal(100).div(numSplits).toDecimalPlaces(2),
        share: null
      };
    });

    // Reconcile rounding remainder
    const remainder = totalAmount.sub(sum);
    if (!remainder.isZero()) {
      computedSplits[computedSplits.length - 1].amount = computedSplits[computedSplits.length - 1].amount.add(remainder);
    }
  } 
  else if (splitType === 'PERCENTAGE') {
    // Verify percentages sum to exactly 100
    let totalPct = new Prisma.Decimal(0);
    splits.forEach((s) => {
      totalPct = totalPct.add(new Prisma.Decimal(s.percentage));
    });

    if (!totalPct.equals(100)) {
      throw new AppError('Total split percentages must sum to exactly 100%.', 400);
    }

    computedSplits = splits.map((s) => {
      const pct = new Prisma.Decimal(s.percentage);
      const amt = totalAmount.mul(pct).div(100).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      sum = sum.add(amt);
      return {
        userId: s.userId,
        amount: amt,
        percentage: pct,
        share: null
      };
    });

    // Reconcile rounding remainder
    const remainder = totalAmount.sub(sum);
    if (!remainder.isZero()) {
      computedSplits[computedSplits.length - 1].amount = computedSplits[computedSplits.length - 1].amount.add(remainder);
    }
  } 
  else if (splitType === 'UNEQUAL') {
    // Verify shares sum to exactly totalAmount
    let totalShares = new Prisma.Decimal(0);
    splits.forEach((s) => {
      totalShares = totalShares.add(new Prisma.Decimal(s.share));
    });

    if (!totalShares.equals(totalAmount)) {
      throw new AppError(`Total unequal shares (${totalShares.toString()}) must equal the expense amount (${totalAmount.toString()}).`, 400);
    }

    computedSplits = splits.map((s) => {
      const sh = new Prisma.Decimal(s.share);
      return {
        userId: s.userId,
        amount: sh,
        percentage: null,
        share: sh
      };
    });
  }

  return computedSplits;
};

/**
 * Create an expense and splits.
 */
export const createExpense = async (payload) => {
  const { groupId, amount, description, category, splitType, paidById, splits, transactionDate, currency, importId, importRowId } = payload;
  const expenseDate = transactionDate ? new Date(transactionDate) : new Date();

  // 1. Verify group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) {
    throw new AppError('Group not found.', 404);
  }

  // 2. Validate Payer membership on transaction date
  await validateMemberOnDate(groupId, paidById, expenseDate);

  // 3. Validate split participants memberships on transaction date
  const participantIds = splits.map((s) => s.userId);
  for (const pId of participantIds) {
    await validateMemberOnDate(groupId, pId, expenseDate);
  }

  // 4. Resolve exchange rate to INR
  const expenseCurrency = currency ? currency.toUpperCase() : 'USD';
  const rate = await getEffectiveRate(expenseCurrency, 'INR', expenseDate);
  if (!rate) {
    throw new AppError(`No exchange rate found from ${expenseCurrency} to INR on or before ${expenseDate.toISOString().split('T')[0]}.`, 400);
  }

  // 5. Calculate precise decimal shares
  const totalAmount = new Prisma.Decimal(amount);
  const decimalRate = new Prisma.Decimal(rate);
  const normalizedAmount = totalAmount.mul(decimalRate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  const calculatedSplits = calculateSplits(totalAmount, splitType, splits);

  // 6. Execute creation transaction
  return await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        groupId,
        paidById,
        amount: totalAmount,
        currency: expenseCurrency,
        description,
        category,
        splitType,
        transactionDate: expenseDate,
        originalAmount: totalAmount,
        originalCurrency: expenseCurrency,
        exchangeRate: decimalRate,
        normalizedAmount,
        importId,
        importRowId
      }
    });

    const splitData = calculatedSplits.map((s) => ({
      expenseId: expense.id,
      userId: s.userId,
      amount: s.amount,
      percentage: s.percentage,
      share: s.share
    }));

    await tx.expenseSplit.createMany({
      data: splitData
    });

    return await tx.expense.findUnique({
      where: { id: expense.id },
      include: {
        splits: true
      }
    });
  });
};

/**
 * Update an existing expense and recalculate splits.
 */
export const updateExpense = async (expenseId, payload) => {
  // 1. Verify expense exists and is not deleted
  const existingExpense = await prisma.expense.findUnique({
    where: { id: expenseId }
  });

  if (!existingExpense || existingExpense.isDeleted) {
    throw new AppError('Expense not found.', 404);
  }

  const groupId = existingExpense.groupId;
  const amount = payload.amount !== undefined ? payload.amount : existingExpense.amount;
  const currency = payload.currency !== undefined ? payload.currency.toUpperCase() : existingExpense.currency;
  const paidById = payload.paidById !== undefined ? payload.paidById : existingExpense.paidById;
  const splitType = payload.splitType !== undefined ? payload.splitType : existingExpense.splitType;
  const description = payload.description !== undefined ? payload.description : existingExpense.description;
  const category = payload.category !== undefined ? payload.category : existingExpense.category;
  const expenseDate = payload.transactionDate ? new Date(payload.transactionDate) : existingExpense.transactionDate;

  // 2. Validate Payer membership
  await validateMemberOnDate(groupId, paidById, expenseDate);

  // 3. Resolve exchange rate to INR
  const rate = await getEffectiveRate(currency, 'INR', expenseDate);
  if (!rate) {
    throw new AppError(`No exchange rate found from ${currency} to INR on or before ${expenseDate.toISOString().split('T')[0]}.`, 400);
  }

  const totalAmount = new Prisma.Decimal(amount);
  const decimalRate = new Prisma.Decimal(rate);
  const normalizedAmount = totalAmount.mul(decimalRate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  let calculatedSplits = [];
  if (payload.splits) {
    // Validate custom input split list
    const participantIds = payload.splits.map((s) => s.userId);
    for (const pId of participantIds) {
      await validateMemberOnDate(groupId, pId, expenseDate);
    }
    calculatedSplits = calculateSplits(totalAmount, splitType, payload.splits);
  } else {
    // If splits list is not provided, fetch old participants and recalculate splits based on new amount/type
    const oldSplits = await prisma.expenseSplit.findMany({
      where: { expenseId }
    });

    let remappedSplits = [];
    if (splitType === existingExpense.splitType) {
      // Retain old percentages/shares
      remappedSplits = oldSplits.map((s) => ({
        userId: s.userId,
        percentage: s.percentage,
        share: s.share
      }));
    } else {
      // If split type changes but no splits provided, fall back to EQUAL splits among old participants
      remappedSplits = oldSplits.map((s) => ({ userId: s.userId }));
    }

    // Re-validate old participants on new transaction date
    for (const s of remappedSplits) {
      await validateMemberOnDate(groupId, s.userId, expenseDate);
    }

    calculatedSplits = calculateSplits(totalAmount, splitType, remappedSplits);
  }

  // 4. Save updates atomically
  return await prisma.$transaction(async (tx) => {
    const updatedExpense = await tx.expense.update({
      where: { id: expenseId },
      data: {
        paidById,
        amount: totalAmount,
        currency,
        description,
        category,
        splitType,
        transactionDate: expenseDate,
        originalAmount: totalAmount,
        originalCurrency: currency,
        exchangeRate: decimalRate,
        normalizedAmount
      }
    });

    // Delete old splits
    await tx.expenseSplit.deleteMany({
      where: { expenseId }
    });

    // Create new splits
    const splitData = calculatedSplits.map((s) => ({
      expenseId,
      userId: s.userId,
      amount: s.amount,
      percentage: s.percentage,
      share: s.share
    }));

    await tx.expenseSplit.createMany({
      data: splitData
    });

    return await tx.expense.findUnique({
      where: { id: expenseId },
      include: {
        splits: true
      }
    });
  });
};

/**
 * Soft delete an expense.
 */
export const deleteExpense = async (expenseId) => {
  const existing = await prisma.expense.findUnique({
    where: { id: expenseId }
  });

  if (!existing || existing.isDeleted) {
    throw new AppError('Expense not found.', 404);
  }

  return await prisma.expense.update({
    where: { id: expenseId },
    data: {
      isDeleted: true
    }
  });
};

/**
 * Get detailed expense view.
 */
export const getExpenseDetails = async (expenseId) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      paidBy: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true
        }
      },
      splits: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      }
    }
  });

  if (!expense || expense.isDeleted) {
    throw new AppError('Expense not found.', 404);
  }

  return expense;
};

/**
 * Get all active expenses in a group.
 */
export const getGroupExpenses = async (groupId) => {
  // Verify group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) {
    throw new AppError('Group not found.', 404);
  }

  return await prisma.expense.findMany({
    where: {
      groupId,
      isDeleted: false
    },
    include: {
      paidBy: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true
        }
      },
      splits: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      }
    },
    orderBy: {
      transactionDate: 'desc'
    }
  });
};

export default {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseDetails,
  getGroupExpenses
};
