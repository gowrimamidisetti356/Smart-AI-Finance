import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';
const AuthPage = lazy(() => import('./components/auth/AuthPage'));
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
const DashboardView = lazy(() => import('./components/dashboard/DashboardView'));
const TransactionsView = lazy(() => import('./components/transactions/TransactionsView'));
import AddTransactionModal from './components/transactions/AddTransactionModal';
const AnalyticsView = lazy(() => import('./components/analytics/AnalyticsView'));
const GoalsView = lazy(() => import('./components/goals/GoalsView'));
const AIAssistantView = lazy(() => import('./components/ai/AIAssistantView'));
const AccountsView = lazy(() => import('./components/accounts/AccountsView'));
const ReceiptScannerView = lazy(() => import('./components/receipts/ReceiptScannerView'));
const SettingsView = lazy(() => import('./components/settings/SettingsView'));
import {
  transactionsApi,
  analyticsApi,
  goalsApi,
  accountsApi
} from './services/api';
import { Loader2, Sparkles } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activePage, setActivePage] = useState('Dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Global Backend Entities State
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netSavings: 0 });
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

  // Fetch all backend data
  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsDataLoading(true);
    else setIsRefreshing(true);

    try {
      const [txData, summaryData, goalsData, accountsData] = await Promise.allSettled([
        transactionsApi.getAll(),
        analyticsApi.getSummary(),
        goalsApi.getAll(),
        accountsApi.getAll(),
      ]);

      if (txData.status === 'fulfilled' && Array.isArray(txData.value)) {
        setTransactions(txData.value);
      }
      if (summaryData.status === 'fulfilled' && summaryData.value) {
        setSummary(summaryData.value);
      }
      if (goalsData.status === 'fulfilled' && Array.isArray(goalsData.value)) {
        setGoals(goalsData.value);
      }
      if (accountsData.status === 'fulfilled' && Array.isArray(accountsData.value)) {
        setAccounts(accountsData.value);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsDataLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  // Transaction CRUD Handlers
  const handleAddTransaction = async (txData) => {
    try {
      const newTx = await transactionsApi.create(txData);
      setTransactions((prev) => [newTx, ...prev]);

      // Update summary optimistically
      const amt = parseFloat(txData.amount);
      setSummary((prev) => {
        const income = txData.type === 'income' ? prev.totalIncome + amt : prev.totalIncome;
        const expenses = txData.type === 'expense' ? prev.totalExpenses + amt : prev.totalExpenses;
        return {
          totalIncome: income,
          totalExpenses: expenses,
          netSavings: income - expenses,
        };
      });

      showToast(`Transaction "${txData.name}" recorded successfully.`, 'success');
      loadDashboardData(true);
    } catch (err) {
      showToast(err.message || 'Failed to save transaction', 'error');
      throw err;
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionsApi.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Transaction deleted successfully.', 'success');
      loadDashboardData(true);
    } catch (err) {
      showToast(err.message || 'Failed to delete transaction', 'error');
    }
  };

  // Goals CRUD Handlers
  const handleAddGoal = async (goalData) => {
    try {
      const newGoal = await goalsApi.create(goalData);
      setGoals((prev) => [newGoal, ...prev]);
      showToast(`Goal "${goalData.title}" created successfully!`, 'success');
      loadDashboardData(true);
    } catch (err) {
      showToast(err.message || 'Failed to create goal', 'error');
      throw err;
    }
  };

  const handleUpdateGoal = async (id, updateData) => {
    try {
      const updated = await goalsApi.update(id, updateData);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));

      if (updated.status === 'completed') {
        showToast(`🎉 Congratulations! You achieved your goal: "${updated.title}"!`, 'success', 5000);
      } else {
        showToast(`Contributed funds to "${updated.title}" successfully.`, 'success');
      }
      loadDashboardData(true);
    } catch (err) {
      showToast(err.message || 'Failed to update goal', 'error');
      throw err;
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalsApi.delete(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      showToast('Goal deleted.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete goal', 'error');
    }
  };

  // Accounts CRUD Handlers
  const handleAddAccount = async (accData) => {
    try {
      const newAcc = await accountsApi.create(accData);
      setAccounts((prev) => [newAcc, ...prev]);
      showToast('Account linked securely.', 'success');
      loadDashboardData(true);
    } catch (err) {
      showToast(err.message || 'Failed to link account', 'error');
      throw err;
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await accountsApi.delete(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast('Account unlinked successfully.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
    }
  };

  // Loading Screen for Session Restore
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl mb-4 animate-pulse">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Restoring Encrypted Session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, show modern AuthPage
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-slate-900" role="status">Loading sign-in...</div>}>
        <AuthPage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          activePage={activePage}
          onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
          onRefresh={() => loadDashboardData(true)}
          isRefreshing={isRefreshing}
          setMobileOpen={setMobileOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          <Suspense fallback={<div className="py-12 text-center text-slate-500" role="status">Loading page...</div>}>
            {activePage === 'Dashboard' && (
              <DashboardView
                transactions={transactions}
                summary={summary}
                goals={goals}
                isLoading={isDataLoading}
                onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
                onNavigate={(page) => setActivePage(page)}
              />
            )}

            {activePage === 'Transactions' && (
              <TransactionsView
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            )}

            {activePage === 'Analytics' && (
              <AnalyticsView
                transactions={transactions}
                summary={summary}
                onNavigate={(page) => setActivePage(page)}
              />
            )}

            {activePage === 'Goals' && (
              <GoalsView
                goals={goals}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            )}

            {activePage === 'AI Assistant' && <AIAssistantView />}

            {activePage === 'Accounts' && (
              <AccountsView
                accounts={accounts}
                onAddAccount={handleAddAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activePage === 'Receipt Scanner' && (
              <ReceiptScannerView
                onAddTransaction={handleAddTransaction}
                onNavigate={(page) => setActivePage(page)}
              />
            )}

            {activePage === 'Settings' && (
              <SettingsView
                transactions={transactions}
                goals={goals}
                accounts={accounts}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ToastProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </ToastProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
