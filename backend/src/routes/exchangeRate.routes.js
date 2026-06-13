import { Router } from 'express';
import * as exchangeRateController from '../controllers/exchangeRate.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Secure all exchange rate endpoints
router.use(requireAuth);

// Create or update an exchange rate
router.post('/', exchangeRateController.create);

// List all exchange rates
router.get('/', exchangeRateController.list);

// Query currency conversion simulation
router.get('/convert', exchangeRateController.convert);

export default router;
