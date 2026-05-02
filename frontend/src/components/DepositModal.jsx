import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { deposit } from '../services/api';

export default function DepositModal({ accountId, onClose, onSuccess }) {
  const [amount, setAmount]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: () => deposit(accountId, amount),
    onSuccess: () => {
      setSuccessMsg(`✓ $${parseFloat(amount).toFixed(2)} deposited to ${accountId} successfully!`);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    },
  });

  const handleSubmit = () => {
    reset();
    setSuccessMsg('');
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      alert('Enter a valid amount greater than zero');
      return;
    }
    mutate();
  };

  return (
    <div className="modal-overlay" onClick={!isPending ? onClose : undefined}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h3>Add Money to Wallet</h3>
          <button className="modal-close" onClick={onClose} disabled={isPending}>✕</button>
        </div>

        {/* Account context strip */}
        <div className="deposit-account-info">
          <span className="deposit-account-label">Depositing into</span>
          <span className="deposit-account-id">{accountId}</span>
        </div>

        <div className="form-field">
          <label className="field-label">Amount <span className="required">*</span></label>
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
              autoFocus
              disabled={isPending || !!successMsg}
            />
          </div>
        </div>

        {error && !successMsg && (
          <div className="form-error" role="alert">{error.message}</div>
        )}
        {successMsg && (
          <div className="form-success" role="status">{successMsg}</div>
        )}

        <div className="modal-actions">
          <button className="btn-ghost-outline" onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button
            className="btn-deposit"
            onClick={handleSubmit}
            disabled={isPending || !amount || !!successMsg}
            aria-busy={isPending}
          >
            {isPending
              ? <span className="btn-loading"><span className="spinner" />  Depositing…</span>
              : '+ Add Money'
            }
          </button>
        </div>

      </div>
    </div>
  );
}
