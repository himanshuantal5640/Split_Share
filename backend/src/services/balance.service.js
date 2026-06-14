import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';

/**
 * Safely converts a value (Decimal, number, string) to a Prisma.Decimal.
 */
const toDecimal = (val) => {
  if (val === undefined || val === null) {
    return new Prisma.Decimal(0);
  }
  return new Prisma.Decimal(val);
};

/**
 * Checks whether a transactionDate falls within the user's active membership interval.
 * @param {Date|string} transactionDate - Date of transaction
 * @param {Date|string} joinedAt - Date user joined group
 * @param {Date|string} leftAt - Date user left group (optional)
 * @returns {boolean} True if transaction occurred during active membership
 */
const isTransactionWithinMembership = (transactionDate, joinedAt, leftAt) => {
  try {
    const txStr = new Date(transactionDate).toISOString().split('T')[0];
    const joinStr = new Date(joinedAt).toISOString().split('T')[0];
    
    if (txStr < joinStr) {
      return false;
    }
    
    if (leftAt) {
      const leaveStr = new Date(leftAt).toISOString().split('T')[0];
      if (txStr > leaveStr) {
        return false;
      }
    }
  } catch (err) {
    console.error('Error checking balance date intervals:', err);
    return true; // Default fallback to active if date parsing fails
  }
  
  return true;
};

/**
 * Calculates net balance for all members of a group.
 * Respects group membership history and uses normalized amounts in INR.
 * @param {number} groupId - The group ID
 * @returns {Promise<Array>} List of member balances
 */
export const calculateGroupBalances = async (groupId) => {
  // 1. Verify group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) {
    throw new AppError('Group not found.', 404);
  }

  // 2. Fetch all memberships (including status LEFT)
  const memberships = await prisma.groupMembership.findMany({
    where: { groupId },
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
  });

  // 3. Fetch all active expenses and splits in the group
  const expenses = await prisma.expense.findMany({
    where: { groupId, isDeleted: false },
    include: {
      splits: true
    }
  });

  // 4. Fetch all active settlements in the group
  const settlements = await prisma.settlement.findMany({
    where: { groupId, isDeleted: false }
  });

  // 5. Calculate balances for each member
  const balances = memberships.map((membership) => {
    const { user, joinedAt, leftAt } = membership;
    const userId = user.id;

    let totalPaidExpenses = toDecimal(0);
    let totalOwedSplits = toDecimal(0);
    let totalPaidSettlements = toDecimal(0);
    let totalReceivedSettlements = toDecimal(0);

    // Aggregate expenses
    expenses.forEach((expense) => {
      if (isTransactionWithinMembership(expense.transactionDate, joinedAt, leftAt)) {
        // Did the user pay for the expense?
        if (expense.paidById === userId) {
          totalPaidExpenses = totalPaidExpenses.add(toDecimal(expense.normalizedAmount));
        }

        // Does the user owe a split for this expense?
        const split = expense.splits.find((s) => s.userId === userId);
        if (split) {
          const splitOriginal = toDecimal(split.amount);
          const rate = toDecimal(expense.exchangeRate);
          const splitNormalized = splitOriginal.mul(rate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
          totalOwedSplits = totalOwedSplits.add(splitNormalized);
        }
      }
    });

    // Aggregate settlements
    settlements.forEach((settlement) => {
      if (isTransactionWithinMembership(settlement.transactionDate, joinedAt, leftAt)) {
        // Did the user pay this settlement?
        if (settlement.payerId === userId) {
          totalPaidSettlements = totalPaidSettlements.add(toDecimal(settlement.normalizedAmount));
        }

        // Did the user receive this settlement?
        if (settlement.payeeId === userId) {
          totalReceivedSettlements = totalReceivedSettlements.add(toDecimal(settlement.normalizedAmount));
        }
      }
    });

    const netBalance = totalPaidExpenses
      .sub(totalOwedSplits)
      .add(totalPaidSettlements)
      .sub(totalReceivedSettlements)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    return {
      userId,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      joinedAt: membership.joinedAt,
      leftAt: membership.leftAt,
      status: membership.status,
      totalPaidExpenses: totalPaidExpenses.toNumber(),
      totalOwedSplits: totalOwedSplits.toNumber(),
      totalPaidSettlements: totalPaidSettlements.toNumber(),
      totalReceivedSettlements: totalReceivedSettlements.toNumber(),
      netBalance: netBalance.toNumber()
    };
  });

  return balances;
};

/**
 * Calculates net balance for one user across all groups they belong to.
 * @param {number} userId - The user ID
 * @returns {Promise<object>} Balance summary
 */
export const calculateUserBalances = async (userId) => {
  // 1. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // 2. Fetch all group memberships of the user
  const memberships = await prisma.groupMembership.findMany({
    where: { userId },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });

  const groupBalances = [];
  let totalNetBalance = toDecimal(0);

  for (const m of memberships) {
    const groupBalList = await calculateGroupBalances(m.groupId);
    const userBalRecord = groupBalList.find((b) => b.userId === userId);
    
    if (userBalRecord) {
      groupBalances.push({
        groupId: m.group.id,
        groupName: m.group.name,
        groupDescription: m.group.description,
        netBalance: userBalRecord.netBalance
      });
      totalNetBalance = totalNetBalance.add(toDecimal(userBalRecord.netBalance));
    }
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    totalNetBalance: totalNetBalance.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP).toNumber(),
    groupBalances
  };
};

/**
 * Generates a traceable breakdown explaining which transactions contributed to a user's balance.
 * @param {number} userId - The user ID
 * @param {number} [groupId] - Optional filter for specific group
 * @returns {Promise<object|Array>} Detail breakdown list or object
 */
export const getUserBreakdown = async (userId, groupId = null) => {
  // 1. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // 2. Fetch memberships
  const membershipQuery = { userId };
  if (groupId) {
    membershipQuery.groupId = groupId;
  }

  const memberships = await prisma.groupMembership.findMany({
    where: membershipQuery,
    include: {
      group: {
        select: {
          id: true,
          name: true,
          description: true
        }
      }
    }
  });

  if (groupId && memberships.length === 0) {
    throw new AppError('User membership in group not found.', 404);
  }

  const breakdowns = [];

  for (const m of memberships) {
    const { joinedAt, leftAt } = m;
    const gId = m.groupId;

    // Fetch all active expenses paid by the user in this group
    const expensesPaidDb = await prisma.expense.findMany({
      where: {
        groupId: gId,
        paidById: userId,
        isDeleted: false
      },
      orderBy: { transactionDate: 'desc' }
    });

    const expensesPaid = expensesPaidDb
      .filter((e) => isTransactionWithinMembership(e.transactionDate, joinedAt, leftAt))
      .map((e) => ({
        expenseId: e.id,
        description: e.description,
        category: e.category,
        amount: toDecimal(e.amount).toNumber(),
        currency: e.currency,
        exchangeRate: toDecimal(e.exchangeRate).toNumber(),
        normalizedAmount: toDecimal(e.normalizedAmount).toNumber(),
        transactionDate: e.transactionDate
      }));

    // Fetch all active splits owed by the user in this group
    const splitsOwedDb = await prisma.expenseSplit.findMany({
      where: {
        userId,
        expense: {
          groupId: gId,
          isDeleted: false
        }
      },
      include: {
        expense: {
          include: {
            paidBy: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: {
        expense: { transactionDate: 'desc' }
      }
    });

    const splitsOwed = splitsOwedDb
      .filter((s) => isTransactionWithinMembership(s.expense.transactionDate, joinedAt, leftAt))
      .map((s) => {
        const splitOriginal = toDecimal(s.amount);
        const rate = toDecimal(s.expense.exchangeRate);
        const splitNormalized = splitOriginal.mul(rate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

        return {
          splitId: s.id,
          expenseId: s.expense.id,
          expenseDescription: s.expense.description,
          paidById: s.expense.paidById,
          paidByName: s.expense.paidBy.name,
          originalAmount: splitOriginal.toNumber(),
          currency: s.expense.currency,
          exchangeRate: rate.toNumber(),
          normalizedAmount: splitNormalized.toNumber(),
          transactionDate: s.expense.transactionDate
        };
      });

    // Fetch all active settlements paid by the user in this group
    const settlementsPaidDb = await prisma.settlement.findMany({
      where: {
        groupId: gId,
        payerId: userId,
        isDeleted: false
      },
      include: {
        payee: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });

    const settlementsPaid = settlementsPaidDb
      .filter((s) => isTransactionWithinMembership(s.transactionDate, joinedAt, leftAt))
      .map((s) => ({
        settlementId: s.id,
        receiverId: s.payeeId,
        receiverName: s.payee.name,
        originalAmount: toDecimal(s.amount).toNumber(),
        currency: s.currency,
        exchangeRate: toDecimal(s.exchangeRate).toNumber(),
        normalizedAmount: toDecimal(s.normalizedAmount).toNumber(),
        transactionDate: s.transactionDate
      }));

    // Fetch all active settlements received by the user in this group
    const settlementsReceivedDb = await prisma.settlement.findMany({
      where: {
        groupId: gId,
        payeeId: userId,
        isDeleted: false
      },
      include: {
        payer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });

    const settlementsReceived = settlementsReceivedDb
      .filter((s) => isTransactionWithinMembership(s.transactionDate, joinedAt, leftAt))
      .map((s) => ({
        settlementId: s.id,
        payerId: s.payerId,
        payerName: s.payer.name,
        originalAmount: toDecimal(s.amount).toNumber(),
        currency: s.currency,
        exchangeRate: toDecimal(s.exchangeRate).toNumber(),
        normalizedAmount: toDecimal(s.normalizedAmount).toNumber(),
        transactionDate: s.transactionDate
      }));

    // Calculate summaries
    let totalPaidExpensesVal = toDecimal(0);
    expensesPaid.forEach((e) => {
      totalPaidExpensesVal = totalPaidExpensesVal.add(toDecimal(e.normalizedAmount));
    });

    let totalOwedSplitsVal = toDecimal(0);
    splitsOwed.forEach((s) => {
      totalOwedSplitsVal = totalOwedSplitsVal.add(toDecimal(s.normalizedAmount));
    });

    let totalPaidSettlementsVal = toDecimal(0);
    settlementsPaid.forEach((s) => {
      totalPaidSettlementsVal = totalPaidSettlementsVal.add(toDecimal(s.normalizedAmount));
    });

    let totalReceivedSettlementsVal = toDecimal(0);
    settlementsReceived.forEach((s) => {
      totalReceivedSettlementsVal = totalReceivedSettlementsVal.add(toDecimal(s.normalizedAmount));
    });

    const finalBalance = totalPaidExpensesVal
      .sub(totalOwedSplitsVal)
      .add(totalPaidSettlementsVal)
      .sub(totalReceivedSettlementsVal)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    breakdowns.push({
      groupId: gId,
      groupName: m.group.name,
      groupDescription: m.group.description,
      summary: {
        totalPaidExpenses: totalPaidExpensesVal.toNumber(),
        totalOwedSplits: totalOwedSplitsVal.toNumber(),
        totalPaidSettlements: totalPaidSettlementsVal.toNumber(),
        totalReceivedSettlements: totalReceivedSettlementsVal.toNumber(),
        finalBalance: finalBalance.toNumber()
      },
      breakdown: {
        expensesPaid,
        splitsOwed,
        settlementsPaid,
        settlementsReceived
      }
    });
  }

  // If a single group was requested, return it directly rather than wrapped in array
  if (groupId) {
    return breakdowns[0];
  }

  return breakdowns;
};

export default {
  calculateGroupBalances,
  calculateUserBalances,
  getUserBreakdown
};
