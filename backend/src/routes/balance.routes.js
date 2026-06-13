import { Router } from 'express';
import * as balanceController from '../controllers/balance.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all balance routes
router.use(requireAuth);

// Get group net balances
router.get('/group/:groupId', balanceController.getGroupBalances);

// Get user net balances across groups
router.get('/user/:userId', balanceController.getUserBalances);

// Get user transaction-level balance breakdown
router.get('/user/:userId/breakdown', balanceController.getUserBreakdown);

export default router;
