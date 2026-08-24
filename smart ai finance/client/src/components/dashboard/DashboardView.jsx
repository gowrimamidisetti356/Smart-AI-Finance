import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Target,
  Sparkles,
  Plus,
  ArrowRight,
  AlertCircle,
  Coffee,
  ShoppingCart,
  CarFront,
  CreditCard,
  Briefcase,
  ShoppingBag,
  HeartPulse,
  Film,
  Zap,
  Calendar,
  Layers,
  Lightbulb
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

const CATEGORY_ICONS = {
  Food: { icon: Coffee, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
  Shopping: { icon: ShoppingCart, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  Travel: { icon: CarFront, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  Bills: { icon: CreditCard, color: 'text-red-500 bg-red-50 dark:bg-red-950/40' },
  Salary: { icon: Briefcase, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  Entertainment: { icon: Film, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40' },
  Health: { icon: HeartPulse, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40' },
  Other: { icon: ShoppingBag, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/40' },
};

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#14B8A6', '#F43F5E'];

export default function DashboardView({
  transactions = [],
  summary = {},
  goals = [],
  isLoading = false,
  onOpenAddTransaction,
  onNavigate
}) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { formatCurrency, formatCompact } = useCurrency();
  const [timeRange, setTimeRange] = useState('30d'); // '7d' | '30d' | 'all'

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Calculated metrics
  const totalIncome = summary.totalIncome !== undefined ? summary.totalIncome : transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalExpenses = summary.totalExpenses !== undefined ? summary.totalExpenses : transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const netSavings = summary.netSavings !== undefined ? summary.netSavings : (totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Chart Data: Cash Flow Timeline filtered by timeRange
  const chartData = useMemo(() => {
    if (transactions.length === 0) {
      return [
        { name: 'Day 1', income: 0, expense: 0 },
        { name: 'Day 2', income: 0, expense: 0 },
        { name: 'Day 3', income: 0, expense: 0 },
        { name: 'Day 4', income: 0, expense: 0 },
        { name: 'Day 5', income: 0, expense: 0 },
      ];
    }

    const dayMap = {};
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    let sliceCount = 30;
    if (timeRange === '7d') sliceCount = 7;
    if (timeRange === 'all') sliceCount = sorted.length;

    sorted.slice(-sliceCount).forEach(t => {
      const dateLabel = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dayMap[dateLabel]) {
        dayMap[dateLabel] = { name: dateLabel, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        dayMap[dateLabel].income += parseFloat(t.amount || 0);
      } else {
        dayMap[dateLabel].expense += parseFloat(t.amount || 0);
      }
    });

    const list = Object.values(dayMap);
    return list.length > 0 ? list : [{ name: 'Today', income: totalIncome, expense: totalExpenses }];
  }, [transactions, timeRange, totalIncome, totalExpenses]);

  // Category Pie Data
  const categoryData = useMemo(() => {
    const catMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + parseFloat(t.amount || 0);
      });

    const data = Object.keys(catMap).map(cat => ({
      name: cat,
      value: catMap[cat]
    })).sort((a, b) => b.value - a.value);

    return data.length > 0 ? data : [{ name: 'No Expenses', value: 1 }];
  }, [transactions]);

  // Financial Health Score & dynamic AI insight
  const { healthScore, topExpenseCat, topCatAmount } = useMemo(() => {
    const catMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + parseFloat(t.amount || 0);
    });

    let topCat = 'General';
    let topAmt = 0;
    for (const [cat, amt] of Object.entries(catMap)) {
      if (amt > topAmt) {
        topCat = cat;
        topAmt = amt;
      }
    }

    let scoreObj = { score: 70, status: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', tip: `Reviewing ${topCat} expenses (${formatCurrency(topAmt)}) can boost your monthly buffer.` };

    if (totalIncome === 0 && totalExpenses === 0) {
      scoreObj = { score: 75, status: 'Balanced', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30', tip: 'Start recording transactions to generate detailed cashflow scores.' };
    } else if (savingsRate >= 30) {
      scoreObj = { score: 94, status: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', tip: `Savings rate at ${savingsRate}%. Excellent wealth velocity!` };
    } else if (savingsRate >= 15) {
      scoreObj = { score: 80, status: 'Healthy', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30', tip: `Top category is ${topCat} (${formatCurrency(topAmt)}). Trimming 10% will add to savings.` };
    } else if (savingsRate >= 0) {
      scoreObj = { score: 58, status: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', tip: 'Expenses are taking most of your income. Consider setting discretionary limits.' };
    } else {
      scoreObj = { score: 35, status: 'Deficit Alert', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', tip: 'Spending currently exceeds income. Audit recurring bills immediately.' };
    }

    return { healthScore: scoreObj, topExpenseCat: topCat, topCatAmount: topAmt };
  }, [savingsRate, totalIncome, totalExpenses, transactions, formatCurrency]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-950/15 border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-56 h-56 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>{formattedDate}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              {greeting}, {user?.name ? user.name.split(' ')[0] : 'User'} 👋
            </h2>
            <p className="text-indigo-200 text-xs sm:text-sm max-w-xl leading-relaxed">
              Here is your real-time financial overview. Your records are encrypted and synchronized with PostgreSQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('AI Assistant')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs sm:text-sm border border-white/20 transition-all cursor-pointer shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>AI Advisor Chat</span>
            </button>
            <button
              onClick={onOpenAddTransaction}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record Transaction</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Net Balance */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Balance</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              {formatCurrency(netSavings)}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
              <span className={`flex items-center ${netSavings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {netSavings >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {savingsRate}%
              </span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">savings rate</span>
            </div>
          </div>
        </div>

        {/* Total Income */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Income</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(totalIncome)}
            </h3>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <span className="font-medium text-emerald-500">Live</span>
              <span>from active accounts</span>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-rose-600 dark:text-rose-400">
              -{formatCurrency(totalExpenses)}
            </h3>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <span className="font-medium text-rose-500">{transactions.filter(t => t.type === 'expense').length}</span>
              <span>expenses recorded</span>
            </div>
          </div>
        </div>

        {/* AI Health Score Card */}
        <div className="glass-card p-5 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Health Score</span>
            <div className={`w-10 h-10 rounded-xl ${healthScore.bg} ${healthScore.color} flex items-center justify-center shadow-inner`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                {healthScore.score}<span className="text-base text-slate-400 font-normal">/100</span>
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${healthScore.bg} ${healthScore.color}`}>
                {healthScore.status}
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${healthScore.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Financial Smart Insight Banner */}
      <div className="glass-card p-4 sm:p-5 border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/20">
            <Lightbulb className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live AI Financial Recommendation
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-0.5 leading-snug">
              {healthScore.tip}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('AI Assistant')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer"
        >
          <span>Ask AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Area Chart */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Cash Flow Dynamics
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Income vs Expense breakdown over transactions
              </p>
            </div>

            {/* Time range filters */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-semibold self-start sm:self-auto">
              {[
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
                { id: 'all', label: 'All Time' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    timeRange === tab.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke={isDark ? '#64748B' : '#94A3B8'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? '#64748B' : '#94A3B8'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatCompact(val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#131A29' : '#FFFFFF',
                    borderColor: isDark ? '#1E293B' : '#E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#F1F5F9' : '#0F172A',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [formatCurrency(value), '']}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                  name="Expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Breakdown */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Spending by Category
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Distribution of current spending
            </p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#131A29' : '#FFFFFF',
                    borderColor: isDark ? '#1E293B' : '#E2E8F0',
                    borderRadius: '12px',
                    color: isDark ? '#F1F5F9' : '#0F172A',
                    fontSize: '12px'
                  }}
                  formatter={(value) => [formatCurrency(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-300 truncate">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Transactions & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Recent Transactions
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Latest recorded activities in PostgreSQL
              </p>
            </div>
            <button
              onClick={() => onNavigate('Transactions')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">No transactions recorded yet.</p>
              <button
                onClick={onOpenAddTransaction}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {transactions.slice(0, 5).map((t) => {
                const categoryInfo = CATEGORY_ICONS[t.category] || CATEGORY_ICONS.Other;
                const Icon = categoryInfo.icon;
                const isIncome = t.type === 'income';

                return (
                  <div key={t.id} className="py-3 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryInfo.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {t.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span>{t.category}</span>
                          <span>•</span>
                          <span>{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-sm font-bold ${isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Savings Goals Overview */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Active Goals
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Target milestones
                </p>
              </div>
              <button
                onClick={() => onNavigate('Goals')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-8">
                <PiggyBank className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No active savings goals.</p>
                <button
                  onClick={() => onNavigate('Goals')}
                  className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Create a Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.slice(0, 3).map((g) => {
                  const target = parseFloat(g.target_amount || g.target || 0);
                  const current = parseFloat(g.current_amount || g.saved || 0);
                  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

                  return (
                    <div key={g.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {g.title}
                        </span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{formatCurrency(current)} saved</span>
                        <span>Target: {formatCurrency(target)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">AI Savings Buffer</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">20% Monthly Target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
