import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';

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

  const checkTime = new Date(date).getTime();
  const joinedTime = new Date(membership.joinedAt).getTime();

  if (checkTime < joinedTime) {
    throw new AppError(`User ${userId} had not joined the group yet on the settlement date.`, 400);
  }

  if (membership.status === 'LEFT' && membership.leftAt) {
    const leftTime = new Date(membership.leftAt).getTime();
    if (checkTime > leftTime) {
      throw new AppError(`User ${userId} had already left the group on the settlement date.`, 400);
    }
  }
};

/**
 * Creates a new settlement record.
 * @param {object} payload - Settlement fields { groupId, payerId, receiverId, amount, transactionDate, currency }
 * @returns {object} The created settlement
 */
export const createSettlement = async (payload) => {
  const { groupId, payerId, receiverId, amount, transactionDate, currency } = payload;
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

  // 3. Create settlement in the database
  const totalAmount = new Prisma.Decimal(amount);

  return await prisma.settlement.create({
    data: {
      groupId,
      payerId,
      payeeId: receiverId, // maps receiverId to payeeId in Prisma Schema
      amount: totalAmount,
      currency: currency || 'USD',
      transactionDate: settlementDate,
      isCompleted: true,
      isDeleted: false
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

  return await prisma.settlement.findMany({
    where: {
      groupId,
      isDeleted: false
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
    },
    orderBy: {
      transactionDate: 'desc'
    }
  });
};

/**
 * Soft deletes a settlement record.
 * @param {number} settlementId - The settlement ID
 * @returns {object} The updated settlement record
 */
export const deleteSettlement = async (settlementId) => {
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
