import { Router } from 'express';
import * as systemController from '../controllers/system.controller.js';

const router = Router();

// Public readiness check for Kubernetes/orchestration tools
router.get('/system/readiness', systemController.getReadiness);

// Public health check returning sub-component diagnostics
router.get('/system/health', systemController.getHealth);

export default router;
