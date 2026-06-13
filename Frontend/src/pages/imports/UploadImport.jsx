import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ImportUploadForm from '../../components/imports/ImportUploadForm';
import { listGroups } from '../../api/groupApi';
import { useImports } from '../../hooks/useImports';

const UploadImport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(queryGroupId || '');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupError, setGroupError] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  
  const { uploadImport, loading: uploading } = useImports();

  // Load user groups to target import circle
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await listGroups();
        setGroups(data);
        if (data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data[0].id.toString());
        }
      } catch (err) {
        console.error(err);
        setGroupError('Failed to retrieve your group circles. Ensure the server is online.');
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const handleUploadSubmit = async (file) => {
    if (!selectedGroupId) {
      setUploadError('Please select a target group circle for this transaction upload.');
      return;
    }

    setUploadError(null);
    setUploadProgress(1); // Set initial progress

    try {
      const result = await uploadImport(
        parseInt(selectedGroupId, 10),
        file,
        (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Clamp upload progress strictly below 100% to account for backend parsing delay
          setUploadProgress(Math.min(99, percentCompleted));
        }
      );

      setUploadProgress(100);
      // Success redirect to details page of the import job
      navigate(`/imports/${result.id}`);
    } catch (err) {
      console.error(err);
      setUploadProgress(0);
      setUploadError(
        err.response?.data?.message ||
        'Upload failed. Check if all required headers (Description, Amount, Category, Payer, Date) are present in the CSV.'
      );
    }
  };

  const error = groupError || uploadError;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Upload CSV Ledger"
        subtitle="Import multiple transactions or peer settlements simultaneously using a formatted CSV template."
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed flex items-start gap-2.5">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loadingGroups ? (
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 animate-pulse h-[300px]" />
      ) : (
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur shadow-xl flex flex-col gap-6">
          
          {/* Target Group Selector */}
          <div className="flex flex-col gap-2 max-w-xs">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Target Group Circle
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              disabled={uploading}
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
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

          {/* CSV File Dropzone */}
          <ImportUploadForm
            onSubmit={handleUploadSubmit}
            loading={uploading}
            progress={uploadProgress}
            error={uploadError}
          />
        </div>
      )}
    </div>
  );
};

export default UploadImport;
