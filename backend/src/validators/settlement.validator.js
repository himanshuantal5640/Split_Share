/**
 * Validates settlement creation payload.
 * @param {object} body - Request body containing settlement parameters
 * @returns {object} { isValid, errors }
 */
export const validateCreateSettlement = (body) => {
  const errors = {};
  const { groupId, payerId, receiverId, amount, transactionDate, currency } = body || {};

  const gId = parseInt(groupId, 10);
  if (isNaN(gId) || gId <= 0) {
    errors.groupId = 'Please provide a valid group ID.';
  }

  const pId = parseInt(payerId, 10);
  if (isNaN(pId) || pId <= 0) {
    errors.payerId = 'Please provide a valid payer ID.';
  }

  const rId = parseInt(receiverId, 10);
  if (isNaN(rId) || rId <= 0) {
    errors.receiverId = 'Please provide a valid receiver ID.';
  }

  if (!isNaN(pId) && !isNaN(rId) && pId === rId) {
    errors.receiverId = 'Payer and receiver cannot be the same user.';
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    errors.amount = 'Amount must be a positive number.';
  }

  if (transactionDate) {
    const parsedDate = Date.parse(transactionDate);
    if (isNaN(parsedDate)) {
      errors.transactionDate = 'Please provide a valid transaction date.';
    }
  }

  if (currency) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];
    if (!validCurrencies.includes(currency)) {
      errors.currency = `Currency must be one of: ${validCurrencies.join(', ')}.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateCreateSettlement
};
