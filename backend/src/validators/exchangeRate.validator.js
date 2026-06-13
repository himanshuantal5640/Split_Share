const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

/**
 * Validates request payload for creating/updating an exchange rate.
 * @param {object} body - Request body
 * @returns {object} { isValid, errors }
 */
export const validateCreateExchangeRate = (body) => {
  const errors = {};
  const { fromCurrency, toCurrency, rate, effectiveDate } = body || {};

  if (!fromCurrency || !VALID_CURRENCIES.includes(fromCurrency.toUpperCase())) {
    errors.fromCurrency = `fromCurrency is required and must be one of: ${VALID_CURRENCIES.join(', ')}.`;
  }

  if (!toCurrency || !VALID_CURRENCIES.includes(toCurrency.toUpperCase())) {
    errors.toCurrency = `toCurrency is required and must be one of: ${VALID_CURRENCIES.join(', ')}.`;
  }

  const r = parseFloat(rate);
  if (isNaN(r) || r <= 0) {
    errors.rate = 'Rate must be a positive number.';
  }

  if (!effectiveDate) {
    errors.effectiveDate = 'Effective date is required.';
  } else {
    const timestamp = Date.parse(effectiveDate);
    if (isNaN(timestamp)) {
      errors.effectiveDate = 'Please provide a valid effective date.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates query parameters for conversion simulation.
 * @param {object} query - Query parameters (from, to, amount, date)
 * @returns {object} { isValid, errors }
 */
export const validateConversionQuery = (query) => {
  const errors = {};
  const { from, to, amount, date } = query || {};

  if (!from || !VALID_CURRENCIES.includes(from.toUpperCase())) {
    errors.from = `from currency is required and must be one of: ${VALID_CURRENCIES.join(', ')}.`;
  }

  if (!to || !VALID_CURRENCIES.includes(to.toUpperCase())) {
    errors.to = `to currency is required and must be one of: ${VALID_CURRENCIES.join(', ')}.`;
  }

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    errors.amount = 'Amount must be a positive number.';
  }

  if (date) {
    const timestamp = Date.parse(date);
    if (isNaN(timestamp)) {
      errors.date = 'Please provide a valid date.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateCreateExchangeRate,
  validateConversionQuery
};
