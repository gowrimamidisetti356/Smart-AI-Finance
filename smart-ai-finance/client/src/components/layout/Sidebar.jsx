import React from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  BarChart3,
  Target,
  Bot,
  CreditCard,
  ScanLine,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Transactions', label: 'Transactions', icon: ArrowRightLeft },
  { id: 'Analytics', label: 'Analytics & Insights', icon: BarChart3 },
  { id: 'Goals', label: 'Goals & Savings', icon: Target },
  { id: 'AI Assistant', label: 'AI Advisor', icon: Bot, badge: 'Smart AI' },
  { id: 'Accounts', label: 'Linked Accounts', icon: CreditCard },
  { id: 'Receipt Scanner', label: 'Receipt Scanner', icon: ScanLine, badge: 'OCR' },
  { id: 'Settings', label: 'Settings & Security', icon: Settings },
];

export default function Sidebar({
  activePage,
  setActivePage,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-[#111726] border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => handleNavClick('Dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse-slow" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                  Smart AI <span className="text-indigo-600 dark:text-indigo-400">Finance</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Intelligent Guardian
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1.5">
          <div className={`px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 ${isCollapsed ? 'sr-only' : 'block'}`}>
            Menu
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Financial Health Pill preview */}
        {!isCollapsed && (
          <div className="mx-3 my-2 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">Live AI Security</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Encrypted Neon DB connection & real-time financial tracking.
            </p>
          </div>
        )}

        {/* Footer Actions (Theme Toggle & User Profile) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-slate-500 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="truncate">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </button>

          {/* User Info & Logout */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {user?.email || 'user@example.com'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
