import * as debtService from '../services/debt.service.js';
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
 * Get simplified net debts for a group.
 */
export const getSimplifiedBalances = catchAsync(async (req, res) => {
  const groupId = parseIdParam('groupId', req.params.groupId);
  const debts = await debtService.simplifyDebts(groupId);

  // Return formatted array containing only target balance info
  const formattedDebts = debts.map((d) => ({
    fromUserId: d.fromUserId,
    fromUserName: d.fromUserName,
    toUserId: d.toUserId,
    toUserName: d.toUserName,
    amount: d.amount
  }));

  res.status(200).json({
    success: true,
    data: {
      groupId,
      debts: formattedDebts
    }
  });
});

/**
 * Get a detailed group settlement plan outlining recommended payments.
 */
export const getGroupSettlementPlan = catchAsync(async (req, res) => {
  const groupId = parseIdParam('groupId', req.params.groupId);
  const settlementPlan = await debtService.getGroupSettlementPlan(groupId);

  res.status(200).json({
    success: true,
    data: {
      groupId,
      settlementPlan
    }
  });
});

/**
 * Get personalized settlement recommendations for a user across all groups.
 */
export const getUserRecommendations = catchAsync(async (req, res) => {
  const userId = parseIdParam('userId', req.params.userId);
  const recommendations = await debtService.getUserRecommendations(userId);

  res.status(200).json({
    success: true,
    data: {
      userId,
      recommendations
    }
  });
});

export default {
  getSimplifiedBalances,
  getGroupSettlementPlan,
  getUserRecommendations
};
