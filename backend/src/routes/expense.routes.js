import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller.js';
import validateBody from '../middleware/validate.middleware.js';
import { validateCreateExpense, validateUpdateExpense } from '../validators/expense.validator.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all expense endpoints
router.use(requireAuth);

// Create Expense
router.post('/', validateBody(validateCreateExpense), expenseController.create);

// Get Expense Details (payer & split breakdown)
router.get('/:expenseId', expenseController.get);

// Get Group Expenses (active only)
router.get('/group/:groupId', expenseController.listGroupExpenses);

// Update Expense and Splits
router.patch('/:expenseId', validateBody(validateUpdateExpense), expenseController.update);

// Soft Delete Expense
router.delete('/:expenseId', expenseController.deleteExpense);

export default router;
