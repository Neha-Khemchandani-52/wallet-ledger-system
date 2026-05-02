import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBalance } from '../services/api';
import DepositModal from './DepositModal';

export default function BalanceDisplay({ accountId, onAccountValid, onDepositSuccess }) {
  const [showDeposit, setShowDeposit] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['balance', accountId],
    queryFn: () => getBalance(accountId),
    enabled: !!accountId,
    refetchInterval: 30_000,
    retry: false,
  });

  useEffect(() => {
    if (data)    onAccountValid?.(true);
    if (isError) onAccountValid?.(false);
  }, [data, isError, onAccountValid]);

  if (isLoading) {
    return (
      <div className="balance-card balance-loading" aria-busy="true">
        <div className="balance-label">Current Balance</div>
        <div className="balance-skeleton" />
      </div>
    );
  }

  if (isError) return null;

  const balance  = parseFloat(data?.balance ?? data?.data?.balance ?? 0);
  const currency = data?.currency || data?.data?.currency || 'USD';
  const isNeg    = balance < 0;

  return (
    <>
      <div className={`balance-card ${isNeg ? 'balance-negative' : 'balance-positive'}`}>
        <div className="balance-label">Current Balance</div>
        <div className="balance-amount">
          <span className="balance-currency">{currency}</span>
          <span className={`balance-value ${isNeg ? 'text-danger' : 'text-success'}`}>
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="balance-footer">
          <div className="balance-account-id">{accountId}</div>
          <button
            className="btn-add-money"
            onClick={() => setShowDeposit(true)}
            title="Deposit funds into this account"
          >
            + Add Money
          </button>
        </div>
      </div>

      {showDeposit && (
        <DepositModal
          accountId={accountId}
          onClose={() => setShowDeposit(false)}
          onSuccess={() => {
            refetch();
            onDepositSuccess?.();
          }}
        />
      )}
    </>
  );
}
