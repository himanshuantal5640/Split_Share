import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';

/**
 * Generates an import processing summary report.
 * @param {number} importId - The CSV import ID
 * @param {number} userId - The ID of the user requesting the report
 * @returns {Promise<object>} Detailed report object
 */
export const getImportReport = async (importId, userId) => {
  // 1. Fetch import details
  const importRecord = await prisma.import.findUnique({
    where: { id: importId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
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

  // 3. Fetch all anomalies associated with this import's rows
  const anomalies = await prisma.anomaly.findMany({
    where: {
      importRow: {
        importId: importId
      }
    },
    include: {
      resolvedBy: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      importRow: {
        select: {
          rowNumber: true
        }
      }
    },
    orderBy: [
      { importRow: { rowNumber: 'asc' } },
      { id: 'asc' }
    ]
  });

  // Extract resolutions
  const resolutions = anomalies
    .filter(a => a.status === 'APPROVED' || a.status === 'REJECTED')
    .map(a => ({
      anomalyId: a.id,
      rowNumber: a.importRow?.rowNumber,
      type: a.type,
      status: a.status,
      resolutionNote: a.resolutionNote,
      resolvedAt: a.resolvedAt,
      resolvedBy: a.resolvedBy
    }));

  // Format anomalies for summary
  const formattedAnomalies = anomalies.map(a => ({
    id: a.id,
    rowNumber: a.importRow?.rowNumber,
    type: a.type,
    severity: a.severity,
    description: a.description,
    status: a.status,
    createdAt: a.createdAt
  }));

  // 4. Fetch processed generated expenses & settlements
  const expenses = await prisma.expense.findMany({
    where: { importId },
    select: {
      id: true,
      importRowId: true,
      description: true,
      amount: true,
      currency: true,
      normalizedAmount: true,
      transactionDate: true,
      category: true,
      paidById: true
    },
    orderBy: { importRowId: 'asc' }
  });

  const settlements = await prisma.settlement.findMany({
    where: { importId },
    select: {
      id: true,
      importRowId: true,
      amount: true,
      currency: true,
      normalizedAmount: true,
      transactionDate: true,
      payerId: true,
      payeeId: true
    },
    orderBy: { importRowId: 'asc' }
  });

  return {
    importId: importRecord.id,
    summary: {
      originalFilename: importRecord.originalFilename,
      status: importRecord.status,
      totalRows: importRecord.totalRows,
      importedRowsCount: importRecord.importedRowsCount,
      failedRowsCount: importRecord.failedRowsCount,
      errorLog: importRecord.errorLog,
      uploadedBy: importRecord.user,
      createdAt: importRecord.createdAt,
      updatedAt: importRecord.updatedAt
    },
    anomalies: formattedAnomalies,
    resolutions,
    processedRecords: {
      expensesGeneratedCount: expenses.length,
      settlementsGeneratedCount: settlements.length,
      expenses,
      settlements
    }
  };
};

/**
 * Compiles a detailed audit trail report for a specific import.
 * @param {number} importId - The CSV import ID
 * @param {number} userId - The ID of the user requesting the audit trail
 * @returns {Promise<object>} Audit trail report object
 */
export const getAuditTrail = async (importId, userId) => {
  // 1. Fetch import details with all rows
  const importRecord = await prisma.import.findUnique({
    where: { id: importId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      rows: {
        include: {
          anomalies: {
            include: {
              resolvedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          expense: {
            select: {
              id: true,
              amount: true,
              currency: true,
              normalizedAmount: true,
              description: true,
              transactionDate: true
            }
          },
          settlement: {
            select: {
              id: true,
              amount: true,
              currency: true,
              normalizedAmount: true,
              payer: { select: { id: true, name: true } },
              payee: { select: { id: true, name: true } },
              transactionDate: true
            }
          }
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

  // 3. Format row-by-row audit trail details
  const auditRows = importRecord.rows.map(row => {
    let parsedContent = {};
    try {
      parsedContent = JSON.parse(row.rawContent);
    } catch (err) {
      parsedContent = row.rawContent;
    }

    const anomalyHistory = row.anomalies.map(a => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      description: a.description,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));

    const resolutionHistory = row.anomalies
      .filter(a => a.status === 'APPROVED' || a.status === 'REJECTED')
      .map(a => ({
        anomalyId: a.id,
        status: a.status,
        resolutionNote: a.resolutionNote,
        resolvedAt: a.resolvedAt,
        resolvedBy: a.resolvedBy
      }));

    let generatedRecord = null;
    if (row.expense) {
      generatedRecord = {
        type: 'EXPENSE',
        id: row.expense.id,
        description: row.expense.description,
        amount: parseFloat(row.expense.amount.toString()),
        currency: row.expense.currency,
        normalizedAmount: parseFloat(row.expense.normalizedAmount.toString()),
        transactionDate: row.expense.transactionDate
      };
    } else if (row.settlement) {
      generatedRecord = {
        type: 'SETTLEMENT',
        id: row.settlement.id,
        payer: row.settlement.payer.name,
        payee: row.settlement.payee.name,
        amount: parseFloat(row.settlement.amount.toString()),
        currency: row.settlement.currency,
        normalizedAmount: parseFloat(row.settlement.normalizedAmount.toString()),
        transactionDate: row.settlement.transactionDate
      };
    }

    return {
      rowNumber: row.rowNumber,
      isValid: row.isValid,
      validationErrors: row.validationErrors,
      rawContent: parsedContent,
      createdAt: row.createdAt,
      anomalyHistory,
      resolutionHistory,
      generatedRecord
    };
  });

  return {
    sourceImport: {
      importId: importRecord.id,
      groupId: importRecord.groupId,
      originalFilename: importRecord.originalFilename,
      status: importRecord.status,
      totalRows: importRecord.totalRows,
      importedRowsCount: importRecord.importedRowsCount,
      failedRowsCount: importRecord.failedRowsCount,
      errorLog: importRecord.errorLog,
      uploadedBy: importRecord.user,
      createdAt: importRecord.createdAt
    },
    rows: auditRows
  };
};

/**
 * Computes system-wide aggregate statistics.
 * @returns {Promise<object>} Combined metrics and statistics object
 */
export const getSystemStats = async () => {
  const [
    userCount,
    groupCount,
    expenseAggregates,
    settlementAggregates,
    importsByStatus,
    anomaliesByStatus,
    anomaliesByType
  ] = await Promise.all([
    prisma.user.count(),
    prisma.group.count(),
    prisma.expense.aggregate({
      where: { isDeleted: false },
      _count: true,
      _sum: {
        normalizedAmount: true
      }
    }),
    prisma.settlement.aggregate({
      where: { isDeleted: false },
      _count: true,
      _sum: {
        normalizedAmount: true
      }
    }),
    prisma.import.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    }),
    prisma.anomaly.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    }),
    prisma.anomaly.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    })
  ]);

  // Format groupings into structured maps
  const importsStats = {
    total: importsByStatus.reduce((acc, curr) => acc + curr._count.id, 0),
    breakdown: importsByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {})
  };

  const anomaliesStats = {
    total: anomaliesByStatus.reduce((acc, curr) => acc + curr._count.id, 0),
    breakdownByStatus: anomaliesByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {}),
    breakdownByType: anomaliesByType.reduce((acc, curr) => {
      acc[curr.type] = curr._count.id;
      return acc;
    }, {})
  };

  return {
    users: {
      totalCount: userCount
    },
    groups: {
      totalCount: groupCount
    },
    expenses: {
      totalCount: expenseAggregates._count,
      totalNormalizedAmountINR: expenseAggregates._sum.normalizedAmount ? parseFloat(expenseAggregates._sum.normalizedAmount.toString()) : 0
    },
    settlements: {
      totalCount: settlementAggregates._count,
      totalNormalizedAmountINR: settlementAggregates._sum.normalizedAmount ? parseFloat(settlementAggregates._sum.normalizedAmount.toString()) : 0
    },
    imports: importsStats,
    anomalies: anomaliesStats
  };
};

export default {
  getImportReport,
  getAuditTrail,
  getSystemStats
};
