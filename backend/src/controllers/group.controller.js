import * as groupService from '../services/group.service.js';
import { AppError } from '../utils/errors.js';

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper to validate and parse route integer params
const parseIdParam = (paramName, paramVal) => {
  const parsed = parseInt(paramVal, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new AppError(`Invalid parameter: ${paramName} must be a positive integer.`, 400);
  }
  return parsed;
};

/**
 * Create a new group.
 */
export const create = catchAsync(async (req, res) => {
  const { name, description, memberIds } = req.body;
  const group = await groupService.createGroup({ name, description, memberIds }, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: { group }
  });
});

/**
 * List all groups user is member of.
 */
export const list = catchAsync(async (req, res) => {
  const groups = await groupService.getAllGroups(req.user.id);

  res.status(200).json({
    success: true,
    data: { groups }
  });
});

/**
 * Get group detailed profile.
 */
export const get = catchAsync(async (req, res) => {
  const groupId = parseIdParam('groupId', req.params.groupId);
  const groupDetails = await groupService.getGroupDetails(groupId);

  res.status(200).json({
    success: true,
    data: { group: groupDetails }
  });
});

/**
 * Add a member to a group.
 */
export const addMember = catchAsync(async (req, res) => {
  const groupId = parseIdParam('groupId', req.params.groupId);
  const userId = parseIdParam('userId', req.body.userId);

  const membership = await groupService.addMember(groupId, userId);

  res.status(200).json({
    success: true,
    message: 'Member added to group successfully',
    data: { membership }
  });
});

/**
 * Remove a member from a group (soft delete).
 */
export const removeMember = catchAsync(async (req, res) => {
  const groupId = parseIdParam('groupId', req.params.groupId);
  const userId = parseIdParam('userId', req.params.userId);

  const membership = await groupService.removeMember(groupId, userId);

  res.status(200).json({
    success: true,
    message: 'Member removed from group successfully',
    data: { membership }
  });
});

/**
 * List active members in a group.
 */
export const getMembers = catchAsync(async (req, res) => {
  const groupId = parseIdParam('groupId', req.params.groupId);
  const members = await groupService.listMembers(groupId);

  res.status(200).json({
    success: true,
    data: { members }
  });
});

export default {
  create,
  list,
  get,
  addMember,
  removeMember,
  getMembers
};
