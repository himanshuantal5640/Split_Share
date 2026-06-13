import * as exchangeRateService from '../services/exchangeRate.service.js';
import { validateCreateExchangeRate, validateConversionQuery } from '../validators/exchangeRate.validator.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create or update an exchange rate.
 */
export const create = catchAsync(async (req, res) => {
  const { isValid, errors } = validateCreateExchangeRate(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const exchangeRate = await exchangeRateService.createExchangeRate(req.body);

  res.status(201).json({
    success: true,
    message: 'Exchange rate recorded successfully.',
    data: { exchangeRate }
  });
});

/**
 * List all exchange rates.
 */
export const list = catchAsync(async (req, res) => {
  const exchangeRates = await exchangeRateService.getExchangeRates();

  res.status(200).json({
    success: true,
    data: { exchangeRates }
  });
});

/**
 * Query currency conversion simulation.
 */
export const convert = catchAsync(async (req, res) => {
  const { isValid, errors } = validateConversionQuery(req.query);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  const { from, to, amount, date } = req.query;
  const result = await exchangeRateService.convertAmount(amount, from, to, date);

  res.status(200).json({
    success: true,
    data: result
  });
});

export default {
  create,
  list,
  convert
};
