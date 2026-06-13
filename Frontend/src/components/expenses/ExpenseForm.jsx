import React, { useState, useEffect } from 'react';
import { getGroupDetails } from '../../api/groupApi';
import ParticipantSelector, { isUserActiveOnDate } from './ParticipantSelector';
import EqualSplitForm from './EqualSplitForm';
import UnequalSplitForm from './UnequalSplitForm';
import PercentageSplitForm from './PercentageSplitForm';

const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];
const categoryOptions = ['Food', 'Travel', 'Lodging', 'Utilities', 'Entertainment', 'Other'];
const splitTypeOptions = [
  { value: 'EQUAL', label: 'Equally Split' },
  { value: 'UNEQUAL', label: 'Unequally Split' },
  { value: 'PERCENTAGE', label: 'Split by Percentages' },
];

const ExpenseForm = ({ onSubmit, groups = [], initialData = {}, loading = false, error = null }) => {
  const isEdit = !!initialData.id;

  // Form Field States
  const [groupId, setGroupId] = useState(initialData.groupId || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [amount, setAmount] = useState(initialData.amount || '');
  const [currency, setCurrency] = useState(initialData.currency || 'USD');
  const [category, setCategory] = useState(initialData.category || 'Food');
  const [paidById, setPaidById] = useState(initialData.paidById || '');
  const [expenseDate, setExpenseDate] = useState(
    initialData.transactionDate
      ? new Date(initialData.transactionDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [splitType, setSplitType] = useState(initialData.splitType || 'EQUAL');

  // Members lists states
  const [groupMembers, setGroupMembers] = useState([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);

  // Split values states
  const [shares, setShares] = useState({});
  const [percentages, setPercentages] = useState({});

  const [validationError, setValidationError] = useState(null);

  // Load group details to obtain members lists
  useEffect(() => {
    const fetchMembers = async () => {
      if (!groupId) {
        setGroupMembers([]);
        return;
      }
      try {
        const details = await getGroupDetails(parseInt(groupId, 10));
        // Merge activeMembers and historic history to check date availability
        const merged = [
          ...(details.activeMembers || []),
          ...(details.membershipHistory || []),
        ];
        // Remove duplicate user objects if any
        const unique = merged.filter((val, index, self) =>
          self.findIndex((t) => t.userId === val.userId) === index
        );
        setGroupMembers(unique);

        // Populate initial splits if editing this group
        if (isEdit && initialData.groupId === parseInt(groupId, 10) && initialData.splits) {
          const initialIds = initialData.splits.map((s) => s.userId);
          setSelectedParticipantIds(initialIds);

          const initialShares = {};
          const initialPercentages = {};
          initialData.splits.forEach((s) => {
            if (s.share !== null && s.share !== undefined) {
              initialShares[s.userId] = parseFloat(s.share);
            }
            if (s.percentage !== null && s.percentage !== undefined) {
              initialPercentages[s.userId] = parseFloat(s.percentage);
            }
          });
          setShares(initialShares);
          setPercentages(initialPercentages);
        } else {
          // Preselect all active members by default on creation
          const activeIds = (details.activeMembers || []).map((m) => m.userId);
          setSelectedParticipantIds(activeIds);
          setShares({});
          setPercentages({});
        }
      } catch (err) {
        console.error('Failed to load group participants:', err);
      }
    };

    fetchMembers();
  }, [groupId]);

  // Handle payer change validation if selected payer is inactive on target date
  useEffect(() => {
    if (groupMembers.length > 0 && paidById) {
      const payer = groupMembers.find((m) => m.userId === parseInt(paidById, 10));
      if (payer && !isUserActiveOnDate(payer, expenseDate)) {
        setPaidById(''); // Clear payer if they are not active on date
      }
    }
  }, [expenseDate, groupMembers]);

  // Filter selected participants list to ensure they are active on target date
  const activeSelectedParticipants = groupMembers.filter((m) =>
    selectedParticipantIds.includes(m.userId) && isUserActiveOnDate(m, expenseDate)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    // Basic Validations
    if (!groupId) {
      setValidationError('Please select a group circle.');
      return;
    }
    if (!description.trim() || description.trim().length < 3) {
      setValidationError('Description must be at least 3 characters long.');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setValidationError('Amount must be a positive number.');
      return;
    }
    if (!paidById) {
      setValidationError('Please select who paid for this expense.');
      return;
    }
    if (activeSelectedParticipants.length === 0) {
      setValidationError('At least one active participant must be selected to split.');
      return;
    }

    // Split Specific Validations
    let finalSplits = [];

    if (splitType === 'EQUAL') {
      finalSplits = activeSelectedParticipants.map((p) => ({
        userId: p.userId,
      }));
    } else if (splitType === 'UNEQUAL') {
      let sumShares = 0;
      const invalid = activeSelectedParticipants.some((p) => {
        const sh = parseFloat(shares[p.userId]);
        if (isNaN(sh) || sh <= 0) return true;
        sumShares += sh;
        finalSplits.push({ userId: p.userId, share: sh });
        return false;
      });

      if (invalid) {
        setValidationError('Each selected participant must have a positive manual share amount.');
        return;
      }
      if (Math.abs(sumShares - amt) > 0.01) {
        setValidationError(`Total unequal shares sum (${sumShares.toFixed(2)}) must equal the expense amount (${amt.toFixed(2)}).`);
        return;
      }
    } else if (splitType === 'PERCENTAGE') {
      let sumPct = 0;
      const invalid = activeSelectedParticipants.some((p) => {
        const pct = parseFloat(percentages[p.userId]);
        if (isNaN(pct) || pct <= 0) return true;
        sumPct += pct;
        finalSplits.push({ userId: p.userId, percentage: pct });
        return false;
      });

      if (invalid) {
        setValidationError('Each selected participant must have a positive percentage split value.');
        return;
      }
      if (Math.abs(sumPct - 100) > 0.01) {
        setValidationError(`Total percentages must sum to exactly 100% (currently: ${sumPct.toFixed(2)}%).`);
        return;
      }
    }

    onSubmit({
      groupId: parseInt(groupId, 10),
      amount: amt,
      currency,
      description: description.trim(),
      category,
      paidById: parseInt(paidById, 10),
      transactionDate: new Date(expenseDate).toISOString(),
      splitType,
      splits: finalSplits,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {(error || validationError) && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed flex items-start gap-2.5">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Row 1: Group Circle Selection & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Group Circle</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={loading || isEdit}
            className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            required
          >
            <option value="">-- Choose Group --</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction Date</label>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            required
          />
        </div>
      </div>

      {/* Row 2: Title & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description Title</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="e.g. Pizza dinner night"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            required
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Amount & Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Amount</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            placeholder="0.00"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50"
            required
          >
            {currencyOptions.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Paid By (Payer selection) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Who Paid?</label>
        <select
          value={paidById}
          onChange={(e) => setPaidById(e.target.value)}
          disabled={loading || !groupId}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        >
          <option value="">-- Select Payer --</option>
          {groupMembers
            .filter((m) => isUserActiveOnDate(m, expenseDate))
            .map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name} (#{m.userId})
              </option>
            ))}
        </select>
        {!groupId && (
          <span className="text-[10px] text-slate-500">Please choose a group circle first to load payers.</span>
        )}
      </div>

      {/* Group Members Participant Checklist */}
      {groupId && (
        <ParticipantSelector
          members={groupMembers}
          selectedIds={selectedParticipantIds}
          onChange={setSelectedParticipantIds}
          expenseDate={expenseDate}
        />
      )}

      {/* Split Types Selection & Details Forms */}
      {groupId && activeSelectedParticipants.length > 0 && (
        <div className="flex flex-col gap-5 border-t border-slate-900 pt-5 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Split Strategy</label>
            <div className="grid grid-cols-3 gap-2">
              {splitTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSplitType(opt.value)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-colors ${
                    splitType === opt.value
                      ? 'bg-indigo-500/10 border-indigo-500/35 text-indigo-400'
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Split Mode Form Sub-Components */}
          {splitType === 'EQUAL' && (
            <EqualSplitForm
              amount={amount}
              currency={currency}
              selectedParticipants={activeSelectedParticipants}
            />
          )}

          {splitType === 'UNEQUAL' && (
            <UnequalSplitForm
              amount={amount}
              currency={currency}
              selectedParticipants={activeSelectedParticipants}
              shares={shares}
              onChange={setShares}
            />
          )}

          {splitType === 'PERCENTAGE' && (
            <PercentageSplitForm
              amount={amount}
              currency={currency}
              selectedParticipants={activeSelectedParticipants}
              percentages={percentages}
              onChange={setPercentages}
            />
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 mt-4 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? 'Processing transaction...' : isEdit ? 'Save Changes' : 'Record Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;
