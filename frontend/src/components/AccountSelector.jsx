import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllAccounts } from '../services/api';

export default function AccountSelector({ selectedAccount, onSelect }) {
  const [inputValue, setInputValue] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAllAccounts
  });

  const accounts = data?.data || [];
  const hasAccounts = accounts.length > 0;

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    if (!val) { onSelect(null); return; }
    const acc = accounts.find((a) => (a.account_id || a) === val);
    onSelect(acc || val);
  };

  const handleManualLoad = () => {
    if (!inputValue.trim()) return;
    onSelect(inputValue.trim());
    setInputValue('');
  };

  const currentId = selectedAccount?.account_id || selectedAccount || '';

  return (
    <div className="account-selector">
      <label className="field-label">Active Account</label>

      {hasAccounts ? (
        <div className="field-row">
          <select
            className="input-select"
            value={currentId}
            onChange={handleDropdownChange}
          >
            <option value="">— Select an account —</option>
            {accounts.map((acc) => {
              const id = acc.account_id || acc;
              const label = acc.name ? `${acc.name} (${id})` : id;
              return <option key={id} value={id}>{label}</option>;
              
            })}
          </select>
        </div>
      ) : (
        <div className="field-row">
          <input
            className="input-text"
            placeholder="e.g. ACC001"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualLoad()}
          />
          <button className="btn-primary" onClick={handleManualLoad}>
            Load
          </button>
        </div>
      )}

      {isLoading && <span className="field-hint">Loading accounts…</span>}
      {error && <span className="field-hint field-error">Could not load accounts — enter ID manually</span>}
      {currentId && (
        <span className="field-hint field-success">✓ Viewing: <strong>{currentId}</strong></span>
      )}
    </div>
  );
}
