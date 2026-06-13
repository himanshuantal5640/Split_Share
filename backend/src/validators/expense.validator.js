/**
 * Validates expense creation payload.
 * @param {object} body - Request body containing expense parameters
 * @returns {object} { isValid, errors }
 */
export const validateCreateExpense = (body) => {
  const errors = {};
  const { groupId, amount, description, category, splitType, paidById, splits } = body || {};

  const gId = parseInt(groupId, 10);
  if (isNaN(gId) || gId <= 0) {
    errors.groupId = 'Please provide a valid group ID.';
  }

  const pId = parseInt(paidById, 10);
  if (isNaN(pId) || pId <= 0) {
    errors.paidById = 'Please provide a valid payer ID.';
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    errors.amount = 'Amount must be a positive number.';
  }

  if (!description || typeof description !== 'string' || description.trim().length < 3) {
    errors.description = 'Description must be at least 3 characters long.';
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.category = 'Category is required.';
  }

  if (!splitType || !['EQUAL', 'UNEQUAL', 'PERCENTAGE'].includes(splitType)) {
    errors.splitType = 'Split type must be EQUAL, UNEQUAL, or PERCENTAGE.';
  }

  if (!Array.isArray(splits) || splits.length === 0) {
    errors.splits = 'Splits array is required and must not be empty.';
  } else {
    // Validate each split entry
    splits.forEach((split, index) => {
      const uId = parseInt(split.userId, 10);
      if (isNaN(uId) || uId <= 0) {
        errors[`splits[${index}].userId`] = 'Please provide a valid user ID for each participant.';
      }

      if (splitType === 'PERCENTAGE') {
        const pct = parseFloat(split.percentage);
        if (isNaN(pct) || pct <= 0 || pct > 100) {
          errors[`splits[${index}].percentage`] = 'Percentage must be a number between 0 and 100.';
        }
      }

      if (splitType === 'UNEQUAL') {
        const sh = parseFloat(split.share);
        if (isNaN(sh) || sh <= 0) {
          errors[`splits[${index}].share`] = 'Share must be a positive number.';
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates expense updates. Same fields but all are optional.
 */
export const validateUpdateExpense = (body) => {
  const errors = {};
  const { amount, description, category, splitType, paidById, splits } = body || {};

  if (amount !== undefined) {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      errors.amount = 'Amount must be a positive number.';
    }
  }

  if (paidById !== undefined) {
    const pId = parseInt(paidById, 10);
    if (isNaN(pId) || pId <= 0) {
      errors.paidById = 'Please provide a valid payer ID.';
    }
  }

  if (description !== undefined) {
    if (!description || typeof description !== 'string' || description.trim().length < 3) {
      errors.description = 'Description must be at least 3 characters long.';
    }
  }

  if (category !== undefined) {
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      errors.category = 'Category is required.';
    }
  }

  if (splitType !== undefined) {
    if (!['EQUAL', 'UNEQUAL', 'PERCENTAGE'].includes(splitType)) {
      errors.splitType = 'Split type must be EQUAL, UNEQUAL, or PERCENTAGE.';
    }
  }

  if (splits !== undefined) {
    if (!Array.isArray(splits) || splits.length === 0) {
      errors.splits = 'Splits array must not be empty.';
    } else {
      splits.forEach((split, index) => {
        const uId = parseInt(split.userId, 10);
        if (isNaN(uId) || uId <= 0) {
          errors[`splits[${index}].userId`] = 'Please provide a valid user ID for each participant.';
        }

        const effectiveSplitType = splitType || 'EQUAL';
        if (effectiveSplitType === 'PERCENTAGE' && split.percentage !== undefined) {
          const pct = parseFloat(split.percentage);
          if (isNaN(pct) || pct <= 0 || pct > 100) {
            errors[`splits[${index}].percentage`] = 'Percentage must be a number between 0 and 100.';
          }
        }

        if (effectiveSplitType === 'UNEQUAL' && split.share !== undefined) {
          const sh = parseFloat(split.share);
          if (isNaN(sh) || sh <= 0) {
            errors[`splits[${index}].share`] = 'Share must be a positive number.';
          }
        }
      });
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateCreateExpense,
  validateUpdateExpense
};
