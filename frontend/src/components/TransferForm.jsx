import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { transfer, getAllAccounts } from '../services/api';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function friendlyError(message) {
  if (!message) return 'Transfer failed. Please try again.';
  const m = message.toLowerCase();
  if (m.includes('invalid account') || m.includes('both account') || m.includes('registered')) {
    return 'Recipient account does not exist. Please check the account ID.';
  }
  if (m.includes('insufficient')) return message;
  if (m.includes('same account')) return 'Sender and recipient cannot be the same account.';
  if (m.includes('duplicate') || m.includes('already processed')) {
    return 'This transfer was already processed — no duplicate created.';
  }
  return message;
}

export default function TransferForm({ fromAccount, onSuccess }) {
  const [toAccount, setToAccount]   = useState('');
  const [amount, setAmount]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAllAccounts,
  });
  
  const accounts = (accountsData?.data || []).filter(
    (a) => (a.account_id || a) !== fromAccount
  );

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (payload) => transfer(payload),
    onSuccess: () => {
      setSuccessMsg(`✓ Transferred $${parseFloat(amount).toFixed(2)} to ${toAccount} successfully`);
      setToAccount('');
      setAmount('');
      onSuccess?.();
      setTimeout(() => setSuccessMsg(''), 4000);
    },
  });

  // Reset all fields + error when active account changes in dropdown
  useEffect(() => {
    setToAccount('');
    setAmount('');
    setSuccessMsg('');
    reset();
  }, [fromAccount]);

  const validate = () => {
    if (!toAccount.trim()) return 'Please select a recipient account.';
    if (toAccount.trim().toUpperCase() === fromAccount.toUpperCase()) return 'Cannot transfer to the same account.';
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt)) return 'Please enter a valid amount.';
    if (amt <= 0) return 'Amount must be greater than zero.';
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return 'Amount can have at most 2 decimal places.';
    return null;
  };

  const handleSubmit = () => {
    reset();
    setSuccessMsg('');
    const err = validate();
    if (err) { alert(err); return; }
    mutate({
      from_account_id: fromAccount,
      to_account_id:   toAccount.trim(),
      amount:          parseFloat(amount),
      transaction_id:  generateUUID(),
    });
  };

  return (
    <div className="transfer-form">
      <div className="form-field">
        <label className="field-label">From</label>
        <input className="input-text input-disabled" value={fromAccount} readOnly />
      </div>

      <div className="form-field">
        <label className="field-label">To Account</label>
        {accounts.length > 0 ? (
          <select
            className="input-select"
            value={toAccount}
            onChange={(e) => { reset(); setSuccessMsg(''); setToAccount(e.target.value); }}
            disabled={isPending}
          >
            <option value="">— Select recipient —</option>
            {accounts.map((acc) => {
              const id = acc.account_id || acc;
              return <option key={id} value={id}>{acc.name ? `${acc.name} (${id})` : id}</option>;
            })}
          </select>
        ) : (
          <input
            className="input-text"
            placeholder="e.g. ACC002"
            value={toAccount}
            onChange={(e) => { reset(); setSuccessMsg(''); setToAccount(e.target.value); }}
            disabled={isPending}
          />
        )}
      </div>

      <div className="form-field">
        <label className="field-label">Amount</label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">$</span>
          <input
            className="input-text input-with-prefix"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { reset(); setSuccessMsg(''); setAmount(e.target.value); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={isPending}
          />
        </div>
      </div>

      {error && (
        <div className="form-error" role="alert">
          ⚠ {friendlyError(error.message)}
        </div>
      )}
      {successMsg && (
        <div className="form-success" role="status">{successMsg}</div>
      )}

      <button
        className="btn-primary btn-full"
        onClick={handleSubmit}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending
          ? <span className="btn-loading"><span className="spinner" /> Processing…</span>
          : 'Transfer Funds'
        }
      </button>
      <p className="transfer-note">
        Each transfer is atomic and idempotent — safe to retry on network failure.
      </p>
    </div>
  );
}
