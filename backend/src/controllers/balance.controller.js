import * as balanceService from '../services/balance.service.js';
import { AppError } from '../utils/errors.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper to validate and parse route integer params
const parseIdParam = (paramName, paramVal) => {
  const parsed = parseInt(paramVal, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new AppError(`Invalid parameter: ${paramName} must be a positive integer.`, 400);
  }
  return parsed;
};

/**
 * Get net balances for all members of a group.
 */
export const getGroupBalances = catchAsync(async (req, res) => {
  const groupId = parseIdParam('groupId', req.params.groupId);
  const balances = await balanceService.calculateGroupBalances(groupId);

  res.status(200).json({
    success: true,
    data: {
      groupId,
      balances
    }
  });
});

/**
 * Get net balance for one user summarized across all groups.
 */
export const getUserBalances = catchAsync(async (req, res) => {
  const userId = parseIdParam('userId', req.params.userId);
  const summary = await balanceService.calculateUserBalances(userId);

  res.status(200).json({
    success: true,
    data: summary
  });
});

/**
 * Get detailed breakdown for a user explaining how transactions affected their balance.
 */
export const getUserBreakdown = catchAsync(async (req, res) => {
  const userId = parseIdParam('userId', req.params.userId);
  
  let groupId = null;
  if (req.query.groupId) {
    groupId = parseIdParam('groupId', req.query.groupId);
  }

  const breakdown = await balanceService.getUserBreakdown(userId, groupId);

  res.status(200).json({
    success: true,
    data: {
      userId,
      breakdown
    }
  });
});

export default {
  getGroupBalances,
  getUserBalances,
  getUserBreakdown
};
