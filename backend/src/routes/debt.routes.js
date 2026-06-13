import { Router } from 'express';
import * as debtController from '../controllers/debt.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all debt recommendations routes
router.use(requireAuth);

// Get simplified net debts for a group
router.get('/balances/simplified/:groupId', debtController.getSimplifiedBalances);

// Get group settlement plan
router.get('/groups/:groupId/settlement-plan', debtController.getGroupSettlementPlan);

// Get user specific payment/receipt recommendations across all groups
router.get('/balances/user/:userId/recommendations', debtController.getUserRecommendations);

export default router;
