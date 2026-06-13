import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';

/**
 * Creates a new group and adds the creator as the ADMIN member inside a transaction.
 * @param {object} payload - group details { name, description }
 * @param {number} creatorId - ID of user creating the group
 * @returns {object} The created group object
 */
export const createGroup = async ({ name, description }, creatorId) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the Group
    const group = await tx.group.create({
      data: {
        name,
        description
      }
    });

    // 2. Add creator as ADMIN member
    await tx.groupMembership.create({
      data: {
        groupId: group.id,
        userId: creatorId,
        status: 'ACTIVE'
      }
    });

    return group;
  });
};

/**
 * Retrieves all groups where the user is an active member.
 * @param {number} userId - The user ID
 * @returns {Array} List of groups
 */
export const getAllGroups = async (userId) => {
  return await prisma.group.findMany({
    where: {
      memberships: {
        some: {
          userId,
          status: 'ACTIVE'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * Retrieves group info, separating active members and former membership log history.
 * @param {number} groupId - The group ID
 * @returns {object} Group info, active members, and membership history
 */
export const getGroupDetails = async (groupId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: {
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

  if (!group) {
    throw new AppError('Group not found.', 404);
  }

  // Separate memberships into active and historic
  const activeMembers = [];
  const membershipHistory = [];

  group.memberships.forEach((membership) => {
    const { user, ...membershipDetails } = membership;
    const profile = {
      userId: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      joinedAt: membershipDetails.joinedAt,
      leftAt: membershipDetails.leftAt,
      status: membershipDetails.status
    };

    if (membership.status === 'ACTIVE') {
      activeMembers.push(profile);
    } else {
      membershipHistory.push(profile);
    }
  });

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    activeMembers,
    membershipHistory
  };
};

/**
 * Adds a user to a group. Handles re-activating former members.
 * @param {number} groupId - The group ID
 * @param {number} userId - The user ID to add
 * @returns {object} The membership details
 */
export const addMember = async (groupId, userId) => {
  // 1. Verify group exists
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) {
    throw new AppError('Group not found.', 404);
  }

  // 2. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // 3. Check for existing membership
  const existingMembership = await prisma.groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  if (existingMembership) {
    if (existingMembership.status === 'ACTIVE') {
      throw new AppError('User is already an active member of this group.', 400);
    }

    // Reactivate membership if they previously left
    return await prisma.groupMembership.update({
      where: { id: existingMembership.id },
      data: {
        status: 'ACTIVE',
        joinedAt: new Date(),
        leftAt: null
      }
    });
  }

  // Create new active membership
  return await prisma.groupMembership.create({
    data: {
      groupId,
      userId,
      status: 'ACTIVE'
    }
  });
};

/**
 * Removes a member (Logical soft delete).
 * @param {number} groupId - The group ID
 * @param {number} userId - The user ID to remove
 * @returns {object} Updated membership record
 */
export const removeMember = async (groupId, userId) => {
  // 1. Verify membership exists and is active
  const membership = await prisma.groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  if (!membership || membership.status !== 'ACTIVE') {
    throw new AppError('Active membership not found in this group.', 404);
  }

  // 2. Update status to LEFT and log timestamp
  return await prisma.groupMembership.update({
    where: { id: membership.id },
    data: {
      status: 'LEFT',
      leftAt: new Date()
    }
  });
};

/**
 * Lists active members profiles in a group.
 * @param {number} groupId - The group ID
 * @returns {Array} List of active members
 */
export const listMembers = async (groupId) => {
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) {
    throw new AppError('Group not found.', 404);
  }

  const memberships = await prisma.groupMembership.findMany({
    where: {
      groupId,
      status: 'ACTIVE'
    },
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

  return memberships.map((m) => ({
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    avatarUrl: m.user.avatarUrl,
    joinedAt: m.joinedAt
  }));
};
export default {
  createGroup,
  getAllGroups,
  getGroupDetails,
  addMember,
  removeMember,
  listMembers
};
