/**
 * Validates the upload file and request metadata.
 * @param {object} body - The request body (containing groupId)
 * @param {object} file - The file object from multer
 * @returns {object} { isValid, errors }
 */
export const validateUploadRequest = (body, file) => {
  const errors = {};

  const gId = parseInt(body.groupId, 10);
  if (isNaN(gId) || gId <= 0) {
    errors.groupId = 'Please provide a valid group ID.';
  }

  if (!file) {
    errors.file = 'Please upload a CSV file.';
  } else {
    // Check file extension or mime type
    const isCsvExtension = file.originalname.toLowerCase().endsWith('.csv');
    const isCsvMime = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/comma-separated-values'].includes(file.mimetype);

    if (!isCsvExtension && !isCsvMime) {
      errors.file = 'Only CSV files are allowed.';
    }

    // Limit file size to 5MB (5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      errors.file = 'File size must not exceed 5MB.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates a single parsed CSV row for schema requirements.
 * Expected columns: description, amount, category, payer/paidBy, date/transactionDate
 * @param {object} row - The row object parsed from the CSV
 * @returns {object} { isValid, errors: Array<string> }
 */
export const validateCsvRow = (row) => {
  const errors = [];
  if (!row || typeof row !== 'object') {
    return { isValid: false, errors: ['Invalid row object.'] };
  }

  // Find keys ignoring case and spaces/underscores
  const getVal = (possibleKeys) => {
    const keys = Object.keys(row);
    for (const key of keys) {
      const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (possibleKeys.includes(normalizedKey)) {
        return row[key];
      }
    }
    return undefined;
  };

  const amountStr = getVal(['amount', 'sum', 'total', 'cost']);
  const descStr = getVal(['description', 'desc', 'title', 'item']);
  const catStr = getVal(['category', 'cat', 'type']);
  const payerStr = getVal(['payer', 'paidby', 'paidbyid', 'paid_by']);
  const dateStr = getVal(['date', 'transactiondate', 'transaction_date', 'time']);

  // 1. Amount validation
  if (amountStr === undefined || amountStr === null || amountStr.toString().trim() === '') {
    errors.push('Amount column is missing or empty.');
  } else {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) {
      errors.push('Amount must be a positive number.');
    }
  }

  // 2. Description validation
  if (descStr === undefined || descStr === null || descStr.toString().trim() === '') {
    errors.push('Description column is missing or empty.');
  }

  // 3. Category validation
  if (catStr === undefined || catStr === null || catStr.toString().trim() === '') {
    errors.push('Category column is missing or empty.');
  }

  // 4. Payer validation
  if (payerStr === undefined || payerStr === null || payerStr.toString().trim() === '') {
    errors.push('Payer column is missing or empty.');
  }

  // 5. Date validation
  if (dateStr === undefined || dateStr === null || dateStr.toString().trim() === '') {
    errors.push('Date column is missing or empty.');
  } else {
    const parsedDate = Date.parse(dateStr);
    if (isNaN(parsedDate)) {
      errors.push('Date is invalid and cannot be parsed.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateUploadRequest,
  validateCsvRow
};
