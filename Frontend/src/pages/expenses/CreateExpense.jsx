import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import { listGroups } from '../../api/groupApi';
import { createExpense } from '../../api/expenseApi';

const CreateExpense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch groups to populate form selector options
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await listGroups();
        setGroups(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const handleCreateExpense = async (expenseData) => {
    setLoading(true);
    setError(null);
    try {
      await createExpense(expenseData);
      navigate(`/expenses?groupId=${expenseData.groupId}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to log expense. Make sure all participants are active members on the transaction date and exchange rates exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Record Expense"
        subtitle="Log a new group transaction split equally, unequally, or by percentages."
      />

      {loadingGroups ? (
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 animate-pulse h-[300px]"></div>
      ) : (
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur shadow-xl">
          <ExpenseForm
            onSubmit={handleCreateExpense}
            groups={groups}
            initialData={{ groupId: queryGroupId ? parseInt(queryGroupId, 10) : '' }}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

export default CreateExpense;
