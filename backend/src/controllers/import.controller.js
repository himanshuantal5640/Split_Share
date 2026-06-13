import * as importService from '../services/import.service.js';
import { validateUploadRequest } from '../validators/import.validator.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Formats an import record response, parsing raw JSON content of rows.
 */
const formatImportRecord = (record) => {
  if (!record) return null;
  const { rows, ...rest } = record;
  return {
    ...rest,
    rows: rows ? rows.map((r) => {
      let parsed = r.rawContent;
      try {
        parsed = JSON.parse(r.rawContent);
      } catch (err) {
        // Fallback to raw string if parsing fails
      }
      return {
        id: r.id,
        importId: r.importId,
        rowNumber: r.rowNumber,
        rawContent: parsed,
        isValid: r.isValid,
        validationErrors: r.validationErrors,
        createdAt: r.createdAt
      };
    }) : []
  };
};

/**
 * Handle CSV upload and parsing.
 */
export const upload = catchAsync(async (req, res) => {
  // 1. Run upload validation
  const { isValid, errors } = validateUploadRequest(req.body, req.file);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const groupId = parseInt(req.body.groupId, 10);
  const importRecord = await importService.processCsvImport({
    groupId,
    userId: req.user.id,
    fileBuffer: req.file.buffer,
    originalFilename: req.file.originalname
  });

  res.status(201).json({
    success: true,
    message: 'File uploaded and parsed successfully.',
    data: {
      import: formatImportRecord(importRecord)
    }
  });
});

/**
 * List history of imports.
 */
export const list = catchAsync(async (req, res) => {
  const imports = await importService.listImports(req.user.id);

  res.status(200).json({
    success: true,
    data: { imports }
  });
});

/**
 * Get import details and rows.
 */
export const get = catchAsync(async (req, res) => {
  const importId = parseInt(req.params.importId, 10);
  if (isNaN(importId) || importId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid import ID.'
    });
  }

  const importRecord = await importService.getImportDetails(importId, req.user.id);

  res.status(200).json({
    success: true,
    data: {
      import: formatImportRecord(importRecord)
    }
  });
});

export default {
  upload,
  list,
  get
};
