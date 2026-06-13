import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';
import { parseCsv } from '../utils/csvParser.js';
import { validateCsvRow } from '../validators/import.validator.js';

/**
 * Verifies if a user is an active member of a group.
 * @param {number} groupId - The group ID
 * @param {number} userId - The user ID
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
    throw new AppError('You must be an active member of the group to import files.', 403);
  }
};

/**
 * Parses and imports CSV rows into raw ImportRow records.
 * @param {object} params - { groupId, userId, fileBuffer, originalFilename }
 * @returns {object} The finalized Import record
 */
export const processCsvImport = async ({ groupId, userId, fileBuffer, originalFilename }) => {
  // 1. Verify group exists and user belongs to it
  const group = await prisma.group.findUnique({
    where: { id: groupId }
  });
  if (!group) {
    throw new AppError('Group not found.', 404);
  }
  await verifyUserInGroup(groupId, userId);

  // 2. Create initial Import record
  const importRecord = await prisma.import.create({
    data: {
      groupId,
      userId,
      originalFilename,
      status: 'PROCESSING',
      totalRows: 0,
      importedRowsCount: 0,
      failedRowsCount: 0
    }
  });

  try {
    // 3. Parse CSV rows
    const parsedRows = await parseCsv(fileBuffer);
    const rowsToCreate = [];
    let importedCount = 0;
    let failedCount = 0;

    // 4. Validate and compile row payloads
    parsedRows.forEach((row, index) => {
      const rowNum = index + 1;
      const { isValid, errors } = validateCsvRow(row);

      if (isValid) {
        importedCount++;
      } else {
        failedCount++;
      }

      rowsToCreate.push({
        importId: importRecord.id,
        rowNumber: rowNum,
        rawContent: JSON.stringify(row), // preserves raw data exactly
        isValid,
        validationErrors: errors.length > 0 ? errors.join('; ') : null
      });
    });

    // 5. Store all rows in DB and finalize statistics inside a transaction
    return await prisma.$transaction(async (tx) => {
      if (rowsToCreate.length > 0) {
        await tx.importRow.createMany({
          data: rowsToCreate
        });
      }

      return await tx.import.update({
        where: { id: importRecord.id },
        data: {
          status: 'COMPLETED',
          totalRows: parsedRows.length,
          importedRowsCount: importedCount,
          failedRowsCount: failedCount
        },
        include: {
          rows: {
            orderBy: {
              rowNumber: 'asc'
            }
          }
        }
      });
    });
  } catch (error) {
    // 6. Handle errors by marking import as FAILED
    await prisma.import.update({
      where: { id: importRecord.id },
      data: {
        status: 'FAILED',
        errorLog: error.message || 'Unknown parsing error occurred.'
      }
    });
    throw new AppError(`CSV parsing failed: ${error.message}`, 400);
  }
};

/**
 * Retrieves import history for a user across all groups they belong to.
 * @param {number} userId - The user ID
 * @returns {Array} List of imports
 */
export const listImports = async (userId) => {
  return await prisma.import.findMany({
    where: {
      userId
    },
    include: {
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
 * Retrieves detailed rows of a specific import.
 * @param {number} importId - The import ID
 * @param {number} userId - The request user ID (for permission checks)
 * @returns {object} Import details with rows
 */
export const getImportDetails = async (importId, userId) => {
  const importRecord = await prisma.import.findUnique({
    where: { id: importId },
    include: {
      group: {
        select: {
          id: true,
          name: true
        }
      },
      rows: {
        orderBy: {
          rowNumber: 'asc'
        }
      }
    }
  });

  if (!importRecord) {
    throw new AppError('Import not found.', 404);
  }

  // Authorize: user must either be the creator or an active member of the group
  if (importRecord.userId !== userId) {
    await verifyUserInGroup(importRecord.groupId, userId);
  }

  return importRecord;
};

export default {
  processCsvImport,
  listImports,
  getImportDetails
};
