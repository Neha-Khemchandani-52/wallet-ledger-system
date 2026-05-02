import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createAccount } from '../services/api';

export default function CreateAccountModal({ onClose, onCreated }) {
  const [accountId, setAccountId]           = useState('');
  const [name, setName]                     = useState('');
  const [openingBalance, setOpeningBalance] = useState('0.00');
  const [successMsg, setSuccessMsg]         = useState('');

  const isDisabled = isPending => isPending || !!successMsg;

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: () => createAccount(accountId.trim(), name.trim(), openingBalance),
    onSuccess: (data) => {
      const created = data?.data || data;
      const bal = parseFloat(openingBalance || 0);
      const balStr = bal > 0 ? ` with opening balance $${bal.toFixed(2)}` : '';
      setSuccessMsg(`✓ Account "${created.account_id}" created successfully${balStr}!`);
      setTimeout(() => onCreated(created), 1500);
    },
  });

  const handleSubmit = () => {
    reset();
    setSuccessMsg('');
    if (!accountId.trim()) return;
    if (!name.trim()) { alert('Display name is required'); return; }
    // Validate opening balance if entered
    if (openingBalance && (isNaN(parseFloat(openingBalance)) || parseFloat(openingBalance) < 0)) {
      alert('Opening balance can be zero or greater than zero!');
      return;
    }
    
    // if (!openingBalance || parseFloat(openingBalance) <= 0) {
    //   alert('Opening balance is required and must be greater than zero');
    //   return;
    // }
    mutate();
  };

  return (
    <div className="modal-overlay" onClick={!isPending ? onClose : undefined}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Account</h3>
          <button className="modal-close" onClick={onClose} disabled={isPending}>✕</button>
        </div>

        <div className="form-field">
          <label className="field-label">Account ID <span className="required">*</span></label>
          <input
            className="input-text"
            placeholder="e.g. ACC004"
            value={accountId}
            onChange={(e) => { setAccountId(e.target.value); setSuccessMsg(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            disabled={isDisabled(isPending)}
          />
        </div>

        <div className="form-field">
          <label className="field-label">Name <span className="required">*</span></label>
          <input
            className="input-text"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isDisabled(isPending)}
          />
        </div>

        <div className="form-field">
          <label className="field-label">
            Opening Balance
            <span className="field-optional"> (optional)</span>
          </label>
          <div className="input-prefix-wrap">
            <span className="input-prefix">$</span>
            <input
              className="input-text input-with-prefix"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
            />
          </div>
          <span className="field-hint">
            Creates an initial credit ledger entry for this account
          </span>
        </div>

        {error && !successMsg && (
          <div className="form-error" role="alert">{error.message}</div>
        )}
        {successMsg && (
          <div className="form-success" role="status">{successMsg}</div>
        )}

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isDisabled(isPending) || !accountId.trim() || !name.trim() || !openingBalance}
            aria-busy={isPending}
          >
            {isPending
              ? <span className="btn-loading"><span className="spinner" /> Creating…</span>
              : 'Create Account'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
