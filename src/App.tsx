import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { NotificationToast } from './components/common/NotificationToast';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MyFinancialProfile } from './components/profile/MyFinancialProfile';
import { ClearSwapModule } from './components/clearswap/ClearSwapModule';
import { FinancialTimeMachine } from './components/timeMachine/FinancialTimeMachine';
import { CreditFlightSimulator } from './components/creditSimulator/CreditFlightSimulator';
import { LendingManager } from './components/lending/LendingManager';
import { TransactionHistoryView } from './components/transactions/TransactionHistoryView';
import { ScenarioLab } from './components/scenariolab/ScenarioLab';
import { DatabaseSettingsView } from './components/settings/DatabaseSettingsView';
import { SupabaseAuthModal } from './components/auth/SupabaseAuthModal';
import { TransactionReceiptModal } from './components/transactions/TransactionReceiptModal';
import { useApp } from './context/AppContext';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedReceiptTxId, setSelectedReceiptTxId] = useState<string | null>(null);

  const { transactions } = useApp();

  const selectedTransaction = selectedReceiptTxId
    ? transactions.find((t) => t.id === selectedReceiptTxId) || null
    : null;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col lg:flex-row antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        <Topbar
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          onNavigateTab={setCurrentTab}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              onNavigate={setCurrentTab}
              onOpenReceipt={(txId) => setSelectedReceiptTxId(txId)}
            />
          )}

          {currentTab === 'profile' && <MyFinancialProfile />}

          {currentTab === 'clearswap' && (
            <ClearSwapModule
              onOpenReceipt={(txId) => setSelectedReceiptTxId(txId)}
            />
          )}

          {currentTab === 'timeMachine' && <FinancialTimeMachine />}

          {currentTab === 'creditSimulator' && <CreditFlightSimulator />}

          {currentTab === 'lending' && <LendingManager />}

          {currentTab === 'transactions' && (
            <TransactionHistoryView
              onOpenReceipt={(txId) => setSelectedReceiptTxId(txId)}
            />
          )}

          {currentTab === 'scenarioLab' && (
            <ScenarioLab onNavigate={setCurrentTab} />
          )}

          {currentTab === 'settings' && <DatabaseSettingsView />}
        </main>
      </div>

      {/* Floating Notifications */}
      <NotificationToast />

      {/* Supabase Authentication Modal */}
      <SupabaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenSettings={() => setCurrentTab('settings')}
      />

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        transaction={selectedTransaction}
        onClose={() => setSelectedReceiptTxId(null)}
      />
    </div>
  );
};

export default App;
