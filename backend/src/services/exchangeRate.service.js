import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { AppError } from '../utils/errors.js';

/**
 * Creates or updates an exchange rate record.
 * @param {object} payload - Exchange rate properties { fromCurrency, toCurrency, rate, effectiveDate }
 * @returns {Promise<object>} The created/updated exchange rate record
 */
export const createExchangeRate = async (payload) => {
  const { fromCurrency, toCurrency, rate, effectiveDate } = payload;
  const date = new Date(effectiveDate);
  const decimalRate = new Prisma.Decimal(rate);

  return await prisma.exchangeRate.upsert({
    where: {
      fromCurrency_toCurrency_effectiveDate: {
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        effectiveDate: date
      }
    },
    update: {
      rate: decimalRate
    },
    create: {
      fromCurrency: fromCurrency.toUpperCase(),
      toCurrency: toCurrency.toUpperCase(),
      rate: decimalRate,
      effectiveDate: date
    }
  });
};

/**
 * Lists all registered exchange rates.
 * @returns {Promise<Array>} List of exchange rates
 */
export const getExchangeRates = async () => {
  return await prisma.exchangeRate.findMany({
    orderBy: {
      effectiveDate: 'desc'
    }
  });
};

/**
 * Resolves the closest historical exchange rate for a date.
 * If fromCurrency equals toCurrency, returns a default rate of 1.0.
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Destination currency code
 * @param {Date} date - The transaction date
 * @returns {Promise<Prisma.Decimal|null>} The exchange rate Decimal, or null if missing
 */
export const getEffectiveRate = async (fromCurrency, toCurrency, date) => {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  const checkDate = date ? new Date(date) : new Date();

  if (from === to) {
    return new Prisma.Decimal(1.0);
  }

  const rateRecord = await prisma.exchangeRate.findFirst({
    where: {
      fromCurrency: from,
      toCurrency: to,
      effectiveDate: {
        lte: checkDate
      }
    },
    orderBy: {
      effectiveDate: 'desc'
    }
  });

  return rateRecord ? rateRecord.rate : null;
};

/**
 * Helper to simulate currency conversion.
 * @param {number|string} amount - The amount to convert
 * @param {string} from - Source currency
 * @param {string} to - Destination currency
 * @param {Date|string} date - Date to check rate on
 * @returns {Promise<object>} { rate, convertedAmount }
 */
export const convertAmount = async (amount, from, to, date) => {
  const checkDate = date ? new Date(date) : new Date();
  const rate = await getEffectiveRate(from, to, checkDate);

  if (!rate) {
    throw new AppError(`No exchange rate found from ${from} to ${to} on or before ${checkDate.toISOString().split('T')[0]}.`, 404);
  }

  const decimalAmount = new Prisma.Decimal(amount);
  const converted = decimalAmount.mul(rate).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  return {
    rate: rate.toNumber(),
    convertedAmount: converted.toNumber()
  };
};

export default {
  createExchangeRate,
  getExchangeRates,
  getEffectiveRate,
  convertAmount
};
