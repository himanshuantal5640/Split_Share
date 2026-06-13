import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';

/**
 * Helper to assert active membership of a user in a group.
 */
const verifyUserInGroup = async (groupId, userId) => {
  const membership = await prisma.groupMembership.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  });

  if (!membership || membership.status !== 'ACTIVE') {
    throw new AppError('Access denied. You must be an active member of this group.', 403);
  }
};

/**
 * Retrieves all pending anomalies in groups where the user is an active member.
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} List of pending anomalies
 */
export const getPendingAnomalies = async (userId) => {
  return await prisma.anomaly.findMany({
    where: {
      status: 'PENDING',
      group: {
        memberships: {
          some: {
            userId,
            status: 'ACTIVE'
          }
        }
      }
    },
    include: {
      importRow: true,
      group: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * Resolves an anomaly (approves or rejects) with a mandatory note.
 * @param {number} anomalyId - The anomaly ID
 * @param {string} status - APPROVED or REJECTED
 * @param {string} resolutionNote - The auditor resolution note
 * @param {number} userId - The user resolving the anomaly
 * @returns {Promise<object>} The updated anomaly
 */
export const resolveAnomaly = async (anomalyId, status, resolutionNote, userId) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError('Resolution status must be APPROVED or REJECTED.', 400);
  }

  // 1. Fetch anomaly
  const anomaly = await prisma.anomaly.findUnique({
    where: { id: anomalyId }
  });

  if (!anomaly) {
    throw new AppError('Anomaly record not found.', 404);
  }

  // 2. Assert PENDING status
  if (anomaly.status !== 'PENDING') {
    throw new AppError(`Anomaly is not pending; it has already been resolved as '${anomaly.status}'.`, 400);
  }

  // 3. Authorize membership
  await verifyUserInGroup(anomaly.groupId, userId);

  // 4. Update anomaly resolution fields (Audit Trail - Never Delete)
  return await prisma.anomaly.update({
    where: { id: anomalyId },
    data: {
      status,
      resolvedById: userId,
      resolvedAt: new Date(),
      resolutionNote
    },
    include: {
      resolvedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      importRow: true
    }
  });
};

/**
 * Compiles a resolution report for a specific import.
 * @param {number} importId - The import ID
 * @param {number} userId - The request user ID
 * @returns {Promise<object>} Detailed report metadata and stats
 */
export const getImportResolutionReport = async (importId, userId) => {
  // 1. Fetch import details
  const importRecord = await prisma.import.findUnique({
    where: { id: importId }
  });

  if (!importRecord) {
    throw new AppError('Import record not found.', 404);
  }

  // 2. Verify authorization
  await verifyUserInGroup(importRecord.groupId, userId);

  // 3. Fetch all anomalies related to this import
  const anomalies = await prisma.anomaly.findMany({
    where: {
      importRow: {
        importId
      }
    },
    include: {
      importRow: true,
      resolvedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  // 4. Compile statistics
  const total = anomalies.length;
  const approved = anomalies.filter(a => a.status === 'APPROVED').length;
  const rejected = anomalies.filter(a => a.status === 'REJECTED').length;
  const pending = anomalies.filter(a => a.status === 'PENDING').length;

  return {
    importId,
    groupId: importRecord.groupId,
    originalFilename: importRecord.originalFilename,
    status: importRecord.status,
    totalAnomalies: total,
    approvedCount: approved,
    rejectedCount: rejected,
    pendingCount: pending,
    anomalies: anomalies.map(a => ({
      id: a.id,
      rowNumber: a.importRow.rowNumber,
      type: a.type,
      severity: a.severity,
      description: a.description,
      status: a.status,
      resolutionNote: a.resolutionNote,
      resolvedAt: a.resolvedAt,
      resolvedBy: a.resolvedBy ? {
        id: a.resolvedBy.id,
        name: a.resolvedBy.name,
        email: a.resolvedBy.email
      } : null
    }))
  };
};

export default {
  getPendingAnomalies,
  resolveAnomaly,
  getImportResolutionReport
};
