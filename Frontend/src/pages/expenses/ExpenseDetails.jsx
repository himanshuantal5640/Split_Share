import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ExpenseSummary from '../../components/expenses/ExpenseSummary';
import { getExpenseDetails, deleteExpense } from '../../api/expenseApi';

const ExpenseDetails = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenseDetails(parseInt(expenseId, 10));
      setExpense(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to retrieve expense. Make sure it exists in the system.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [expenseId]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this expense record? This action cannot be undone.'
    );
    if (!confirmDelete) return;

    try {
      await deleteExpense(parseInt(expenseId, 10));
      navigate(`/expenses?groupId=${expense.groupId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete expense.');
    }
  };

  if (loading && !expense) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-[40%] mb-4"></div>
        <div className="h-[250px] bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  if (error && !expense) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-2xl flex flex-col gap-4">
        <span>{error}</span>
        <Link to="/expenses" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline">
          Back to Ledgers
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <PageHeader
        title={expense.description}
        subtitle={`Logged under category '${expense.category}' on ${new Date(expense.transactionDate).toLocaleDateString(undefined, { dateStyle: 'full' })}`}
        actions={
          <div className="flex gap-3">
            <Link
              to={`/expenses?groupId=${expense.groupId}`}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              Back
            </Link>
            <Link
              to={`/expenses/${expense.id}/edit`}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold bg-red-650 hover:bg-red-750 text-white shadow transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        }
      />

      {/* Expense Data Cards & Tables */}
      <ExpenseSummary expense={expense} />
    </div>
  );
};

export default ExpenseDetails;
