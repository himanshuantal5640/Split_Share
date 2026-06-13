import * as expenseService from '../services/expense.service.js';
import { AppError } from '../utils/errors.js';

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
 * Create a new expense.
 */
export const create = catchAsync(async (req, res) => {
  const { groupId, amount, description, category, splitType, paidById, splits, transactionDate } = req.body;

  const expense = await expenseService.createExpense({
    groupId: parseInt(groupId, 10),
    paidById: parseInt(paidById, 10),
    amount,
    description,
    category,
    splitType,
    splits,
    transactionDate
  });

  res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: { expense }
  });
});

/**
 * Get detailed view of an expense.
 */
export const get = catchAsync(async (req, res) => {
  const expenseId = parseIdParam('expenseId', req.params.expenseId);
  const expense = await expenseService.getExpenseDetails(expenseId);

  res.status(200).json({
    success: true,
    data: { expense }
  });
});

/**
 * Get all active expenses inside a group.
 */
export const listGroupExpenses = catchAsync(async (req, res) => {
  const groupId = parseIdParam('groupId', req.params.groupId);
  const expenses = await expenseService.getGroupExpenses(groupId);

  res.status(200).json({
    success: true,
    data: { expenses }
  });
});

/**
 * Update an expense.
 */
export const update = catchAsync(async (req, res) => {
  const expenseId = parseIdParam('expenseId', req.params.expenseId);
  const expense = await expenseService.updateExpense(expenseId, req.body);

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: { expense }
  });
});

/**
 * Soft delete an expense.
 */
export const deleteExpense = catchAsync(async (req, res) => {
  const expenseId = parseIdParam('expenseId', req.params.expenseId);
  await expenseService.deleteExpense(expenseId);

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

export default {
  create,
  get,
  listGroupExpenses,
  update,
  deleteExpense
};
