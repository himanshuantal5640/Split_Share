/**
 * Metadata definitions for the 12 anomaly types.
 * Defines type keys, severity ratings, and standard user recommendation actions.
 */
export const ANOMALY_TYPES = {
  DUPLICATE_EXPENSE: {
    type: 'DUPLICATE_EXPENSE',
    severity: 'MEDIUM',
    message: 'This expense looks like a duplicate of another transaction in this import or group.',
    suggestedAction: 'Verify if this expense was already entered and delete it if it is a duplicate.'
  },
  MISSING_PAYER: {
    type: 'MISSING_PAYER',
    severity: 'HIGH',
    message: 'The payer column is empty or missing.',
    suggestedAction: 'Specify a valid payer for this transaction.'
  },
  UNKNOWN_MEMBER: {
    type: 'UNKNOWN_MEMBER',
    severity: 'HIGH',
    message: 'The payer listed is not registered in the system.',
    suggestedAction: 'Register this user in the application or correct the spelling.'
  },
  MEMBERSHIP_CONFLICT: {
    type: 'MEMBERSHIP_CONFLICT',
    severity: 'HIGH',
    message: 'The payer user exists but is not a member of the group.',
    suggestedAction: 'Add this user to the group before recording expenses for them.'
  },
  EX_MEMBER_EXPENSE: {
    type: 'EX_MEMBER_EXPENSE',
    severity: 'HIGH',
    message: 'The payer had already left the group on the transaction date.',
    suggestedAction: 'Adjust the transaction date or re-activate the member in the group.'
  },
  SETTLEMENT_AS_EXPENSE: {
    type: 'SETTLEMENT_AS_EXPENSE',
    severity: 'MEDIUM',
    message: 'This transaction description or structure indicates it is a settlement, not an expense.',
    suggestedAction: 'Record this transaction as a settlement instead of an expense.'
  },
  CURRENCY_MISMATCH: {
    type: 'CURRENCY_MISMATCH',
    severity: 'LOW',
    message: 'The transaction currency does not match the default group currency.',
    suggestedAction: 'Verify the currency and convert the amount if necessary.'
  },
  INVALID_AMOUNT: {
    type: 'INVALID_AMOUNT',
    severity: 'HIGH',
    message: 'The amount is invalid or missing.',
    suggestedAction: 'Correct the amount to be a valid positive decimal.'
  },
  NEGATIVE_AMOUNT: {
    type: 'NEGATIVE_AMOUNT',
    severity: 'HIGH',
    message: 'The amount is negative or zero.',
    suggestedAction: 'Enter a positive amount for the expense.'
  },
  INVALID_PERCENTAGE_SPLIT: {
    type: 'INVALID_PERCENTAGE_SPLIT',
    severity: 'HIGH',
    message: 'The split type is PERCENTAGE but the percentages do not sum to 100%.',
    suggestedAction: 'Adjust individual percentages so they sum to exactly 100%.'
  },
  UNEQUAL_SPLIT_MISMATCH: {
    type: 'UNEQUAL_SPLIT_MISMATCH',
    severity: 'HIGH',
    message: 'The split type is UNEQUAL but the individual shares do not sum to the total amount.',
    suggestedAction: 'Adjust individual shares to match the total transaction amount.'
  },
  PRECISION_ANOMALY: {
    type: 'PRECISION_ANOMALY',
    severity: 'LOW',
    message: 'The amount contains more than 2 decimal places.',
    suggestedAction: 'Round the amount to exactly 2 decimal places.'
  },
  MISSING_EXCHANGE_RATE: {
    type: 'MISSING_EXCHANGE_RATE',
    severity: 'HIGH',
    message: 'No historical exchange rate exists for this currency on or before the transaction date.',
    suggestedAction: 'Please add a valid historical exchange rate for this date and currency.'
  }
};

export default ANOMALY_TYPES;
