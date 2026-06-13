import api from './axios';

/**
 * List active expenses for a group.
 */
export const listGroupExpenses = async (groupId) => {
  const res = await api.get(`/expenses/group/${groupId}`);
  return res.data.data.expenses;
};

/**
 * Get detailed expense breakdown.
 */
export const getExpenseDetails = async (expenseId) => {
  const res = await api.get(`/expenses/${expenseId}`);
  return res.data.data.expense;
};

/**
 * Create a new expense.
 */
export const createExpense = async (expenseData) => {
  const res = await api.post('/expenses', expenseData);
  return res.data.data.expense;
};

/**
 * Update an existing expense.
 */
export const updateExpense = async (expenseId, expenseData) => {
  const res = await api.patch(`/expenses/${expenseId}`, expenseData);
  return res.data.data.expense;
};

/**
 * Soft delete an expense.
 */
export const deleteExpense = async (expenseId) => {
  const res = await api.delete(`/expenses/${expenseId}`);
  return res.data;
};

export default {
  listGroupExpenses,
  getExpenseDetails,
  createExpense,
  updateExpense,
  deleteExpense,
};
