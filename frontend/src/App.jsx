import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AccountSelector from './components/AccountSelector';
import BalanceDisplay from './components/BalanceDisplay';
import TransferForm from './components/TransferForm';
import TransactionList from './components/TransactionList';
import CreateAccountModal from './components/CreateAccountModal';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletApp />
    </QueryClientProvider>
  );
}

function WalletApp() {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountValid, setAccountValid]       = useState(false);
  const [accountLoading, setAccountLoading]   = useState(false);
  const [showCreate, setShowCreate]           = useState(false);

  const handleSelectAccount = (acc) => {
    setSelectedAccount(acc);
    setAccountValid(false);
    setAccountLoading(true);
  };

  const handleDepositSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['balance'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const accountId = selectedAccount?.account_id || selectedAccount || '';

  return (
    <div className="app-root">
      <div className="bg-grid" aria-hidden="true" />

      <header className="app-header">
        <div className="header-inner">
          <div className="logo-mark">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Mini Wallet &amp; Ledger System</span>
          </div>
          <button className="btn-create" onClick={() => setShowCreate(true)}>
            + Create Account
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="hero-label">Mini Wallet &amp; Ledger System</div>

        <div className="top-row">
          <AccountSelector
            selectedAccount={selectedAccount}
            onSelect={handleSelectAccount}
          />
          {accountId && (
            <BalanceDisplay
              accountId={accountId}
              onAccountValid={(valid) => {
                setAccountValid(valid);
                setAccountLoading(false);
              }}
              onDepositSuccess={handleDepositSuccess}
            />
          )}
        </div>

        {accountId && accountLoading && (
          <div className="empty-state">
            <div className="loading-spinner" />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 16 }}>
              Loading account…
            </p>
          </div>
        )}

        {accountId && !accountLoading && accountValid && (
          <div className="dashboard-grid">
            <div className="panel panel-transfer">
              <div className="panel-header">
                <h2 className="panel-title">Transfer Funds</h2>
                <span className="panel-badge">Atomic · Idempotent</span>
              </div>
              <TransferForm
                fromAccount={accountId}
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['balance'] });
                  queryClient.invalidateQueries({ queryKey: ['transactions'] });
                }}
              />
            </div>

            <div className="panel panel-history">
              <div className="panel-header">
                <h2 className="panel-title">Transaction History</h2>
              </div>
              <TransactionList accountId={accountId} />
            </div>
          </div>
        )}

        {accountId && !accountLoading && !accountValid && (
          <div className="not-found-card">
            <div className="not-found-icon">✕</div>
            <div className="not-found-title">
              Account <span className="not-found-id">"{accountId}"</span> not found
            </div>
            <p className="not-found-desc">
              This account ID does not exist in the system yet.
            </p>
            <div className="not-found-actions">
              <button className="btn-primary" onClick={() => setShowCreate(true)}>
                + Create this Account
              </button>
              <span className="not-found-or">or</span>
              <span className="not-found-hint">
                select an existing account from the dropdown above
              </span>
            </div>
          </div>
        )}

        {/* No Account selected yet */}
        {!accountId && (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>Enter/Select an account above to view balance and transactions</p>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateAccountModal
          onClose={() => setShowCreate(false)}
          onCreated={(acc) => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            setSelectedAccount(acc);
            setAccountValid(true);
            setAccountLoading(false);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}