import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import validateBody from '../middleware/validate.middleware.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Registration route
router.post('/register', validateBody(validateRegister), authController.register);

// Login route
router.post('/login', validateBody(validateLogin), authController.login);

// Current user profile route (Protected)
router.get('/me', requireAuth, authController.me);

export default router;
