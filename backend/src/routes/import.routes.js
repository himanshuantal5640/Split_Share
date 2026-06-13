import { Router } from 'express';
import multer from 'multer';
import * as importController from '../controllers/import.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Configure multer memory storage (stores file in buffer)
const upload = multer({
  storage: multer.memoryStorage()
});

// Secure all endpoints under the import namespace
router.use(requireAuth);

// Upload CSV File
router.post('/upload', upload.single('file'), importController.upload);

// List Import History
router.get('/', importController.list);

// Get Import Details (with parsed rows)
router.get('/:importId', importController.get);

export default router;
