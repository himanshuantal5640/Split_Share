import * as settlementService from '../services/settlement.service.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Format a database settlement record to align with Phase 7 output requirements.
 * Mapped payee -> receiver and transactionDate -> settledAt
 */
const formatSettlement = (s) => {
  if (!s) return null;
  const { payee, transactionDate, ...rest } = s;
  return {
    id: rest.id,
    groupId: rest.groupId,
    payerId: rest.payerId,
    payeeId: rest.payeeId,
    amount: rest.amount,
    currency: rest.currency,
    isCompleted: rest.isCompleted,
    isDeleted: rest.isDeleted,
    createdAt: rest.createdAt,
    updatedAt: rest.updatedAt,
    payer: rest.payer || null,
    receiver: payee || null,
    settledAt: transactionDate
  };
};

/**
 * Create a settlement.
 */
export const create = catchAsync(async (req, res) => {
  const settlement = await settlementService.createSettlement(req.body);

  res.status(201).json({
    success: true,
    message: 'Settlement created successfully',
    data: {
      settlement: formatSettlement(settlement)
    }
  });
});

/**
 * Get settlement details.
 */
export const get = catchAsync(async (req, res) => {
  const settlementId = parseInt(req.params.settlementId, 10);
  const settlement = await settlementService.getSettlementDetails(settlementId);

  res.status(200).json({
    success: true,
    data: {
      settlement: formatSettlement(settlement)
    }
  });
});

/**
 * Get all settlements in a group.
 */
export const listGroupSettlements = catchAsync(async (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);
  const settlements = await settlementService.getGroupSettlements(groupId);

  res.status(200).json({
    success: true,
    data: {
      settlements: settlements.map(formatSettlement)
    }
  });
});

/**
 * Delete a settlement.
 */
export const deleteSettlement = catchAsync(async (req, res) => {
  const settlementId = parseInt(req.params.settlementId, 10);
  await settlementService.deleteSettlement(settlementId);

  res.status(200).json({
    success: true,
    message: 'Settlement deleted successfully'
  });
});

export default {
  create,
  get,
  listGroupSettlements,
  deleteSettlement
};
