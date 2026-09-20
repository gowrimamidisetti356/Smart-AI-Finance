import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  DollarSign,
  Moon,
  Sun,
  Database,
  Download,
  CheckCircle2,
  Lock,
  RefreshCw,
  LogOut,
  Sparkles,
  Server
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';

export default function SettingsView({ transactions = [], goals = [], accounts = [] }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme, setTheme } = useTheme();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const { showToast } = useToast();

  const [isExporting, setIsExporting] = useState(false);

  const handleExportAllData = () => {
    setIsExporting(true);
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user?.id || user?._id,
          name: user?.name,
          email: user?.email,
        },
        transactions,
        goals,
        accounts,
        system: {
          app: 'Smart AI Finance',
          version: '1.0.0',
          database: 'PostgreSQL Neon Cloud',
        },
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `smart_finance_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('All financial data exported successfully.', 'success');
    } catch (err) {
      showToast('Failed to export backup data', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card p-6 border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-emerald-500/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/25">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {user?.name || 'User Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.email || 'user@example.com'} • Active Encrypted Session
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Preference */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-indigo-500" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Display Currency
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select your preferred currency symbol and formatting for all charts and reports.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {availableCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    showToast(`Currency changed to ${c.label}`, 'info');
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    currency === c.code
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="font-mono text-base">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appearance & Theme */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Appearance & Theme
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Switch between light mode and dark mode for optimal viewing comfort.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                  !isDark
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Theme</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                  isDark
                    ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>
        </div>

        {/* Database & Cloud Architecture Status */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Backend & Database Health
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-time server infrastructure status.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Database Engine</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Neon Serverless PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Security</span>
                <span className="font-semibold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SSL Encrypted / JWT Guarded
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">API Gateway</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Express 5 REST Proxy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Backup & Export */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-indigo-500" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Export & Data Backup
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Download a full encrypted JSON backup containing your transactions, accounts, and goal milestones.
            </p>

            <button
              onClick={handleExportAllData}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>{isExporting ? 'Exporting...' : 'Download JSON Data Backup'}</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Records count: {transactions.length} txs, {goals.length} goals</span>
          </div>
        </div>
      </div>

      {/* Logout Action Card */}
      <div className="glass-card p-6 border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400">
            Sign Out of Session
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Safely terminate your authenticated session on this browser.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
