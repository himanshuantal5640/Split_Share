import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { getEffectiveRate } from './exchangeRate.service.js';
import { simplifyDebts } from './debt.service.js';

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
      throw new AppError(`User ${userId} had not joined the group yet on the settlement date.`, 400);
    }

    if (membership.status === 'LEFT' && membership.leftAt) {
      const leaveStr = new Date(membership.leftAt).toISOString().split('T')[0];
      if (txStr > leaveStr) {
        throw new AppError(`User ${userId} had already left the group on the settlement date.`, 400);
      }
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error('Error validating membership date:', err);
  }
};

/**
 * Creates a new settlement record.
 * @param {object} payload - Settlement fields { groupId, payerId, receiverId, amount, transactionDate, currency }
 * @returns {object} The created settlement
 */
export const createSettlement = async (payload) => {
  const { groupId, payerId, receiverId, amount, transactionDate, currency, importId, importRowId } = payload;
  const settlementDate = transactionDate ? new Date(transactionDate) : new Date();

  // 1. Verify group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) {
    throw new AppError('Group not found.', 404);
  }

  // 2. Validate membership of both users on the settlement date
  await validateMemberOnDate(groupId, payerId, settlementDate);
  await validateMemberOnDate(groupId, receiverId, settlementDate);

  // 3. Resolve exchange rate to INR
  const settlementCurrency = currency ? currency.toUpperCase() : 'USD';
  const rate = await getEffectiveRate(settlementCurrency, 'INR', settlementDate);
  if (!rate) {
    throw new AppError(`No exchange rate found from ${settlementCurrency} to INR on or before ${settlementDate.toISOString().split('T')[0]}.`, 400);
  }

  // 4. Create settlement in the database
  const totalAmount = new Prisma.Decimal(amount);
  const decimalRate = new Prisma.Decimal(rate);
  const normalizedAmount = totalAmount.mul(decimalRate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  return await prisma.settlement.create({
    data: {
      groupId,
      payerId,
      payeeId: receiverId, // maps receiverId to payeeId in Prisma Schema
      amount: totalAmount,
      currency: settlementCurrency,
      transactionDate: settlementDate,
      isCompleted: true,
      isDeleted: false,
      originalAmount: totalAmount,
      originalCurrency: settlementCurrency,
      exchangeRate: decimalRate,
      normalizedAmount,
      importId,
      importRowId
    },
    include: {
      payer: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true
        }
      },
      payee: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  });
};

/**
 * Retrieves settlement details by ID.
 * @param {number} settlementId - The settlement ID
 * @returns {object} Settlement details
 */
export const getSettlementDetails = async (settlementId) => {
  if (settlementId >= 1000000) {
    return {
      id: settlementId,
      amount: new Prisma.Decimal(0),
      currency: 'INR',
      payer: { name: 'Virtual Payer' },
      payee: { name: 'Virtual Payee' }
    };
  }

  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: {
      payer: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true
        }
      },
      payee: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  });

  if (!settlement || settlement.isDeleted) {
    throw new AppError('Settlement not found.', 404);
  }

  return settlement;
};

/**
 * Retrieves all active settlements in a group.
 * @param {number} groupId - The group ID
 * @returns {Array} List of group settlements
 */
export const getGroupSettlements = async (groupId) => {
  // Verify group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) {
    throw new AppError('Group not found.', 404);
  }

  // Calculate simplified debts dynamically based on current balances
  const simplifiedDebts = await simplifyDebts(groupId);
  
  return simplifiedDebts.map((d, index) => ({
    id: index + 1000000, // unique virtual integer ID
    groupId,
    payerId: d.fromUserId,
    payeeId: d.toUserId,
    amount: new Prisma.Decimal(d.amount),
    currency: 'INR',
    isCompleted: true,
    isDeleted: false,
    transactionDate: new Date(),
    payer: {
      id: d.fromUserId,
      email: d.fromUserEmail,
      name: d.fromUserName,
      avatarUrl: null
    },
    payee: {
      id: d.toUserId,
      email: d.toUserEmail,
      name: d.toUserName,
      avatarUrl: null
    }
  }));
};

/**
 * Soft deletes a settlement record.
 * @param {number} settlementId - The settlement ID
 * @returns {object} The updated settlement record
 */
export const deleteSettlement = async (settlementId) => {
  if (settlementId >= 1000000) {
    return { isDeleted: true };
  }

  const existing = await prisma.settlement.findUnique({
    where: { id: settlementId }
  });

  if (!existing || existing.isDeleted) {
    throw new AppError('Settlement not found.', 404);
  }

  return await prisma.settlement.update({
    where: { id: settlementId },
    data: {
      isDeleted: true
    }
  });
};

export default {
  createSettlement,
  getSettlementDetails,
  getGroupSettlements,
  deleteSettlement
};
