import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../services/api';

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatAmount(amount) {
  const abs = Math.abs(parseFloat(amount));
  return abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TransactionList({ accountId }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['transactions', accountId, page],
    queryFn: () => getTransactions(accountId, page),
    enabled: !!accountId,
    keepPreviousData: true,
  });

  const transactions = data?.data || [];
  const meta = data?.meta || {};
  const totalPages = meta.last_page || 1;

  if (isLoading) {
    return (
      <div className="txn-list">
        {[1, 2, 3].map((i) => (
          <div key={i} className="txn-skeleton" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="txn-error">
        <span>{error.message}</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="txn-empty">
        <div className="txn-empty-icon">◎</div>
        <p>No transactions yet for this account</p>
      </div>
    );
  }

  return (
    <div className="txn-list">
      {transactions.map((txn) => {
        const isCredit = txn.type === 'credit';
        return (
          <div key={txn.id} className={`txn-row ${isCredit ? 'txn-credit' : 'txn-debit'}`}>
            <div className="txn-icon">{isCredit ? '↓' : '↑'}</div>
            <div className="txn-meta">
              <div className="txn-type">{isCredit ? 'Credit' : 'Debit'}</div>
              <div className="txn-id" title={txn.transaction_id}>
                {txn.description || txn.transaction_id?.slice(0, 16) + '…'}
              </div>
              <div className="txn-date">{formatDate(txn.created_at)}</div>
            </div>
            <div className={`txn-amount ${isCredit ? 'amount-credit' : 'amount-debit'}`}>
              {isCredit ? '+' : '−'} ${formatAmount(txn.amount)}
            </div>
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="txn-pagination">
          <button
            className="btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button
            className="btn-ghost btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
