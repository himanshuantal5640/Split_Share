import { Router } from 'express';
import * as groupController from '../controllers/group.controller.js';
import validateBody from '../middleware/validate.middleware.js';
import { validateCreateGroup, validateAddMember } from '../validators/group.validator.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = Router();

// Protect all routes within the group router
router.use(requireAuth);

// Create Group
router.post('/', validateBody(validateCreateGroup), groupController.create);

// Get All Groups user belongs to
router.get('/', groupController.list);

// Get Group Details (with history)
router.get('/:groupId', groupController.get);

// Add Member to Group
router.post('/:groupId/members', validateBody(validateAddMember), groupController.addMember);

// Remove Member from Group (Logical Soft Remove)
router.patch('/:groupId/members/:userId/remove', groupController.removeMember);

// Get Active Members List
router.get('/:groupId/members', groupController.getMembers);

export default router;
