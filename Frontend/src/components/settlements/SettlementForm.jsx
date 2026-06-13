import React, { useState, useEffect } from 'react';
import { getGroupDetails } from '../../api/groupApi';
import { isUserActiveOnDate } from '../expenses/ParticipantSelector';

const currencyOptions = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const SettlementForm = ({ onSubmit, groups = [], loading = false, error = null, initialGroupId = '' }) => {
  const [groupId, setGroupId] = useState(initialGroupId ? initialGroupId.toString() : '');
  const [payerId, setPayerId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const [groupMembers, setGroupMembers] = useState([]);
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
        setPayerId('');
        setReceiverId('');
      } catch (err) {
        console.error('Failed to load group participants:', err);
      }
    };

    fetchMembers();
  }, [groupId]);

  // Handle payer/receiver validation if selected user is inactive on target date
  useEffect(() => {
    if (groupMembers.length > 0) {
      if (payerId) {
        const payer = groupMembers.find((m) => m.userId === parseInt(payerId, 10));
        if (payer && !isUserActiveOnDate(payer, settlementDate)) {
          setPayerId('');
        }
      }
      if (receiverId) {
        const receiver = groupMembers.find((m) => m.userId === parseInt(receiverId, 10));
        if (receiver && !isUserActiveOnDate(receiver, settlementDate)) {
          setReceiverId('');
        }
      }
    }
  }, [settlementDate, groupMembers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!groupId) {
      setValidationError('Please select a group circle.');
      return;
    }
    if (!payerId) {
      setValidationError('Please select who sent the payment.');
      return;
    }
    if (!receiverId) {
      setValidationError('Please select who received the payment.');
      return;
    }
    if (parseInt(payerId, 10) === parseInt(receiverId, 10)) {
      setValidationError('Payer and Receiver cannot be the same user.');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setValidationError('Repayment amount must be a positive number.');
      return;
    }

    onSubmit({
      groupId: parseInt(groupId, 10),
      payerId: parseInt(payerId, 10),
      receiverId: parseInt(receiverId, 10),
      amount: amt,
      currency,
      transactionDate: new Date(settlementDate).toISOString(),
      note: note.trim(), // API ignores this, but form submits it for local UI simulation
    });
  };

  // Filter eligible participants active on target date
  const eligibleMembers = groupMembers.filter((m) => isUserActiveOnDate(m, settlementDate));

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

      {/* Row 1: Group Selector & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Group Circle</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
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
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Settlement Date</label>
          <input
            type="date"
            value={settlementDate}
            onChange={(e) => setSettlementDate(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
            required
          />
        </div>
      </div>

      {/* Row 2: Payer & Payee */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payer (Who Sent Money)</label>
          <select
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            disabled={loading || !groupId}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            required
          >
            <option value="">-- Select Sender --</option>
            {eligibleMembers.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name} (#{m.userId})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payee (Who Received Money)</label>
          <select
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
            disabled={loading || !groupId}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
            required
          >
            <option value="">-- Select Receiver --</option>
            {eligibleMembers.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name} (#{m.userId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Amount & Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount Paid</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            placeholder="0.00"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-all"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all"
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

      {/* Row 4: Memo/Note */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Optional Note</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={loading}
          placeholder="e.g. Cleared flat utilities balance"
          className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 mt-2 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
      >
        {loading ? 'Recording repayment...' : 'Record Settlement'}
      </button>
    </form>
  );
};

export default SettlementForm;
