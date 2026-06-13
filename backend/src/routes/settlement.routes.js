import { Router } from 'express';
import * as settlementController from '../controllers/settlement.controller.js';
import validateBody from '../middleware/validate.middleware.js';
import { validateCreateSettlement } from '../validators/settlement.validator.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all settlement endpoints
router.use(requireAuth);

// Create Settlement
router.post('/', validateBody(validateCreateSettlement), settlementController.create);

// Get Settlement Details
router.get('/:settlementId', settlementController.get);

// Get Group Settlements (active only)
router.get('/group/:groupId', settlementController.listGroupSettlements);

// Soft Delete Settlement
router.delete('/:settlementId', settlementController.deleteSettlement);

export default router;
