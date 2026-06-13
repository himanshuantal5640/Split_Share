import balanceService from './balance.service.js';
import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';

/**
 * Computes simplified debts for a group using a Greedy Debt Settlement algorithm.
 * @param {number} groupId - The group ID
 * @returns {Promise<Array>} List of simplified debt recommendations
 */
export const simplifyDebts = async (groupId) => {
  // 1. Fetch group balances from the Balance Calculation Engine
  const balances = await balanceService.calculateGroupBalances(groupId);

  // 2. Separate members into debtors and creditors
  // We make shallow copies of netBalance so we can modify them safely without changing the original data
  const debtors = [];
  const creditors = [];

  balances.forEach((b) => {
    const net = b.netBalance;
    if (net < -0.009) {
      debtors.push({
        userId: b.userId,
        name: b.name,
        email: b.email,
        netBalance: net // negative value
      });
    } else if (net > 0.009) {
      creditors.push({
        userId: b.userId,
        name: b.name,
        email: b.email,
        netBalance: net // positive value
      });
    }
  });

  const recommendedDebts = [];

  // 3. Greedy Debt Settlement matching logic
  while (debtors.length > 0 && creditors.length > 0) {
    // Sort debtors so that the largest debtor (most negative balance) is at index 0
    debtors.sort((a, b) => a.netBalance - b.netBalance);
    // Sort creditors so that the largest creditor (most positive balance) is at index 0
    creditors.sort((a, b) => b.netBalance - a.netBalance);

    const debtor = debtors[0];
    const creditor = creditors[0];

    const debtAmount = Math.abs(debtor.netBalance);
    const creditAmount = creditor.netBalance;

    const amountToSettle = parseFloat(Math.min(debtAmount, creditAmount).toFixed(2));
    if (amountToSettle < 0.01) {
      break;
    }

    recommendedDebts.push({
      fromUserId: debtor.userId,
      fromUserName: debtor.name,
      fromUserEmail: debtor.email,
      toUserId: creditor.userId,
      toUserName: creditor.name,
      toUserEmail: creditor.email,
      amount: amountToSettle
    });

    // Update balances
    debtor.netBalance += amountToSettle;
    creditor.netBalance -= amountToSettle;

    // Filter out resolved members
    if (Math.abs(debtor.netBalance) < 0.009) {
      debtors.shift();
    }
    if (Math.abs(creditor.netBalance) < 0.009) {
      creditors.shift();
    }
  }

  return recommendedDebts;
};

/**
 * Formats a descriptive settlement plan for a group.
 * @param {number} groupId - The group ID
 * @returns {Promise<Array>} List of formatted group settlement actions
 */
export const getGroupSettlementPlan = async (groupId) => {
  const simplifiedDebts = await simplifyDebts(groupId);

  return simplifiedDebts.map((d) => ({
    from: {
      id: d.fromUserId,
      name: d.fromUserName,
      email: d.fromUserEmail
    },
    to: {
      id: d.toUserId,
      name: d.toUserName,
      email: d.toUserEmail
    },
    amount: d.amount
  }));
};

/**
 * Returns settlement recommendations specifically involving a given user.
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} List of user-specific recommendations across all groups
 */
export const getUserRecommendations = async (userId) => {
  // 1. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // 2. Fetch all groups where the user has membership history
  const memberships = await prisma.groupMembership.findMany({
    where: { userId },
    include: {
      group: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  const recommendations = [];

  for (const m of memberships) {
    const groupId = m.groupId;
    const groupName = m.group.name;

    const groupPlan = await simplifyDebts(groupId);

    // Filter for recommendations involving the user
    groupPlan.forEach((d) => {
      if (d.fromUserId === userId) {
        recommendations.push({
          groupId,
          groupName,
          type: 'PAY',
          user: {
            id: d.toUserId,
            name: d.toUserName,
            email: d.toUserEmail
          },
          amount: d.amount
        });
      } else if (d.toUserId === userId) {
        recommendations.push({
          groupId,
          groupName,
          type: 'RECEIVE',
          user: {
            id: d.fromUserId,
            name: d.fromUserName,
            email: d.fromUserEmail
          },
          amount: d.amount
        });
      }
    });
  }

  return recommendations;
};

export default {
  simplifyDebts,
  getGroupSettlementPlan,
  getUserRecommendations
};
