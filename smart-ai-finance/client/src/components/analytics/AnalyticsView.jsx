import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  Percent,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { analyticsApi } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

const CATEGORY_ADVICE = {
  Food: "Limit restaurant dining to twice a week. Meal prepping can save 15%–30% of monthly food expenditure.",
  Shopping: "Adopt a 48-hour cooling-off rule for non-essential buys to curb impulse purchases.",
  Travel: "Explore transit passes or carpooling to optimize fuel and commuting costs.",
  Bills: "Audit active recurring subscriptions and negotiate variable utility rates.",
  Salary: "Automate 20% of paycheck directly into high-yield savings or investment vehicles.",
  Entertainment: "Look into annual subscription bundles or free community events.",
  Health: "Maintain preventive health checkups and leverage employer wellness benefits.",
  Other: "Tag miscellaneous expenses into clear categories to reduce untracked leaks."
};

export default function AnalyticsView({ transactions = [], summary = {}, onNavigate }) {
  const { isDark } = useTheme();
  const { formatCurrency, formatCompact } = useCurrency();
  const [analyticsRange, setAnalyticsRange] = useState('all'); // 'month' | '3months' | 'year' | 'all'
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    let active = true;
    analyticsApi.getForecast()
      .then(data => {
        if (active) setForecast(data);
      })
      .catch(error => console.error('Could not load financial forecast:', error.message));
    return () => { active = false; };
  }, [transactions]);

  // Filtered transactions for analytics
  const filteredTxs = useMemo(() => {
    if (analyticsRange === 'all') return transactions;

    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.date);
      if (analyticsRange === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (analyticsRange === '3months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return d >= threeMonthsAgo;
      }
      if (analyticsRange === 'year') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [transactions, analyticsRange]);

  // Monthly Aggregate Data
  const { monthlyData, categoryMap, topExpenses, totalIncome, totalExpenses, savingsRate } = useMemo(() => {
    const monthMap = {};
    const cMap = {};
    let incomeSum = 0;
    let expenseSum = 0;

    filteredTxs.forEach((t) => {
      const amt = parseFloat(t.amount || 0);
      if (t.type === 'income') {
        incomeSum += amt;
      } else {
        expenseSum += amt;
        cMap[t.category] = (cMap[t.category] || 0) + amt;
      }

      try {
        const d = new Date(t.date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        if (!monthMap[monthKey]) {
          monthMap[monthKey] = { key: monthKey, name: monthLabel, income: 0, expense: 0, savings: 0 };
        }

        if (t.type === 'income') monthMap[monthKey].income += amt;
        else monthMap[monthKey].expense += amt;
        monthMap[monthKey].savings = monthMap[monthKey].income - monthMap[monthKey].expense;
      } catch (e) {}
    });

    const mData = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
    const sortedCats = Object.entries(cMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const topExpList = filteredTxs.filter(t => t.type === 'expense').sort((a, b) => parseFloat(b.amount || 0) - parseFloat(a.amount || 0)).slice(0, 5);

    const sRate = incomeSum > 0 ? Math.max(0, Math.round(((incomeSum - expenseSum) / incomeSum) * 100)) : 0;

    return {
      monthlyData: mData.length > 0 ? mData : [{ name: 'Current Period', income: incomeSum, expense: expenseSum, savings: incomeSum - expenseSum }],
      categoryMap: sortedCats,
      topExpenses: topExpList,
      totalIncome: incomeSum,
      totalExpenses: expenseSum,
      savingsRate: sRate
    };
  }, [filteredTxs]);

  const avgMonthlyExpense = monthlyData.length > 0 ? (totalExpenses / monthlyData.length) : totalExpenses;
  const emergencyRunwayMonths = avgMonthlyExpense > 0 ? ((totalIncome - totalExpenses) / avgMonthlyExpense).toFixed(1) : 'N/A';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-card p-6 border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-emerald-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Deep Analytics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              Financial Intelligence & Trends
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Multi-month cashflow comparisons, category distribution, and behavioral spending advice.
            </p>
          </div>

          {/* Time range filters */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-sm">
            {[
              { id: 'month', label: 'This Month' },
              { id: '3months', label: '3 Months' },
              { id: 'year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAnalyticsRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  analyticsRange === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Predictive Forecast */}
      <div className="glass-card p-6 border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-white/40 to-indigo-500/5 dark:via-slate-900/20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Next-Month Forecast</h3>
              {forecast && <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">{forecast.confidence} confidence</span>}
            </div>
            <p className="text-xs text-slate-400">A forward estimate based on your recorded monthly cash flow.</p>
          </div>
          {forecast ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              {[
                ['Expected income', forecast.projectedIncome, 'text-emerald-500'],
                ['Expected expenses', forecast.projectedExpenses, 'text-rose-500'],
                ['Expected savings', forecast.projectedSavings, forecast.projectedSavings >= 0 ? 'text-indigo-500' : 'text-rose-500'],
              ].map(([label, value, color]) => (
                <div key={label} className="min-w-36 p-3 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
                  <p className={`mt-1 text-lg font-bold ${color}`}>{formatCurrency(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500">Loading your forecast...</div>
          )}
        </div>
        {forecast && <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{forecast.note}{forecast.expenseTrend > 0 ? ` Expenses increased by ${formatCurrency(forecast.expenseTrend)} in the latest comparison.` : ''}</p>}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Overall Savings Rate</span>
            <Percent className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-2">
            {savingsRate}%
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {savingsRate >= 20 ? 'Above target benchmark (20%)' : 'Below ideal 20% savings target'}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Avg Monthly Burn</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-rose-500 mt-2">
            {formatCurrency(avgMonthlyExpense)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Monthly average expenses</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Highest Single Expense</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-2">
            {topExpenses.length > 0 ? formatCurrency(topExpenses[0].amount) : formatCurrency(0)}
          </h3>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {topExpenses.length > 0 ? topExpenses[0].name : 'No expenses recorded'}
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Savings Buffer</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-emerald-500 mt-2">
            {emergencyRunwayMonths !== 'N/A' && parseFloat(emergencyRunwayMonths) > 0 ? `${emergencyRunwayMonths} mos` : 'Active'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Runway based on current net</p>
        </div>
      </div>

      {/* Monthly Bar Chart Comparison */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Income vs Expenses Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Bar comparison across active recording months
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-300">Expenses</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
              <XAxis dataKey="name" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => formatCompact(val)} />
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
              <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#F43F5E" radius={[6, 6, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown & AI Tailored Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share List */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-1">
            Category Spending Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            Detailed breakdown of where your money goes
          </p>

          {categoryMap.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No expense categories in this period.</p>
          ) : (
            <div className="space-y-4">
              {categoryMap.map((cat) => {
                const percent = totalExpenses > 0 ? ((cat.value / totalExpenses) * 100).toFixed(1) : 0;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(cat.value)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Tailored Advice Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                AI Optimization Recommendations
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Automated financial hygiene checks based on your habits
            </p>

            <div className="space-y-3">
              {categoryMap.slice(0, 3).map((cat) => (
                <div
                  key={cat.name}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {cat.name} Optimization
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {formatCurrency(cat.value)} total
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {CATEGORY_ADVICE[cat.name] || CATEGORY_ADVICE.Other}
                  </p>
                </div>
              ))}
              {categoryMap.length === 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 text-center">
                  Add expense transactions to generate personalized optimization insights.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
            <span className="text-xs text-indigo-900 dark:text-indigo-300 font-medium">Need deeper advisory?</span>
            <button
              onClick={() => onNavigate('AI Assistant')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Chat with AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
