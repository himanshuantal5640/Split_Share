import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import { listGroups } from '../../api/groupApi';
import { getExpenseDetails, updateExpense } from '../../api/expenseApi';

const EditExpense = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [expense, setExpense] = useState(null);
  
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequiredData = async () => {
      setLoadingData(true);
      try {
        const groupList = await listGroups();
        setGroups(groupList);
        
        const details = await getExpenseDetails(parseInt(expenseId, 10));
        setExpense(details);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch configurations.');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchRequiredData();
  }, [expenseId]);

  const handleUpdateExpense = async (expenseData) => {
    setLoading(true);
    setError(null);
    try {
      // Exclude groupId on update since it is not modifiable by the backend usually (it is not part of the standard update schema, or is ignored)
      const { groupId, ...updatePayload } = expenseData;
      await updateExpense(parseInt(expenseId, 10), updatePayload);
      navigate(`/expenses/${expenseId}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to save changes. Verify active member dates and exchange rates.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData && !expense) {
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
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Edit Expense Record"
        subtitle={`Adjust details and splits for transaction: ${expense.description}`}
      />

      <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur shadow-xl">
        <ExpenseForm
          onSubmit={handleUpdateExpense}
          groups={groups}
          initialData={expense}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default EditExpense;
