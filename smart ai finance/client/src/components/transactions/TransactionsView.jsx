import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Calendar,
  ArrowUpDown,
  Coffee,
  ShoppingCart,
  CarFront,
  CreditCard,
  Briefcase,
  Film,
  HeartPulse,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Layers
} from 'lucide-react';
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

const ITEMS_PER_PAGE = 8;

export default function TransactionsView({
  transactions = [],
  onDeleteTransaction,
  onOpenAddTransaction,
  searchTerm: globalSearchTerm,
  setSearchTerm: setGlobalSearchTerm
}) {
  const { formatCurrency } = useCurrency();
  const [localSearch, setLocalSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'income' | 'expense'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const activeSearch = globalSearchTerm !== undefined ? globalSearchTerm : localSearch;

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search filter
        if (activeSearch.trim()) {
          const q = activeSearch.toLowerCase();
          const matchesName = (t.name || '').toLowerCase().includes(q);
          const matchesCat = (t.category || '').toLowerCase().includes(q);
          if (!matchesName && !matchesCat) return false;
        }

        // Type filter
        if (selectedType !== 'all' && t.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
        if (sortBy === 'amount-asc') return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
        return 0;
      });
  }, [transactions, activeSearch, selectedType, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Summary Metrics of filtered
  const filteredSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      const amt = parseFloat(t.amount || 0);
      if (t.type === 'income') income += amt;
      else expense += amt;
    });
    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['ID', 'Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.date,
      `"${(t.name || '').replace(/"/g, '""')}"`,
      t.category,
      t.type,
      parseFloat(t.amount || 0).toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_finance_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoriesList = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => { if (t.category) set.add(t.category); });
    return Array.from(set);
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Filtered Transactions</span>
            <h4 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
              {filteredTransactions.length} <span className="text-xs font-normal text-slate-400">records</span>
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Filtered Income</span>
            <h4 className="text-xl font-bold font-display text-emerald-500 mt-1">
              +{formatCurrency(filteredSummary.income)}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Filtered Expense</span>
            <h4 className="text-xl font-bold font-display text-rose-500 mt-1">
              -{formatCurrency(filteredSummary.expense)}
            </h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Actions */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Type filter */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => {
                if (setGlobalSearchTerm) setGlobalSearchTerm(e.target.value);
                else setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by description or category..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Type Toggle Pills */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-semibold">
            {['all', 'income', 'expense'].map((t) => (
              <button
                key={t}
                onClick={() => { setSelectedType(t); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  selectedType === t
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="date-desc">Newest Date</option>
            <option value="date-asc">Oldest Date</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Actions: Export CSV & Add Transaction */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Download records as CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="glass-card overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Transactions Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No records match your selected filters or search keyword. Try clearing filters or adding a new transaction.
            </p>
            <button
              onClick={onOpenAddTransaction}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition-all"
            >
              Add New Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80">
                <tr>
                  <th className="py-3.5 px-4">Transaction / Merchant</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {paginatedTransactions.map((t) => {
                  const catConfig = CATEGORY_ICONS[t.category] || CATEGORY_ICONS.Other;
                  const Icon = catConfig.icon;
                  const isIncome = t.type === 'income';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${catConfig.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                              {t.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ID: {typeof t.id === 'string' ? `${t.id.substring(0, 8)}...` : t.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                          isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                        }`}>
                          {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span className="capitalize">{t.type}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-bold text-sm ${
                          isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {deleteConfirmId === t.id ? (
                          <div className="flex items-center justify-center gap-1.5 animate-fadeIn">
                            <button
                              onClick={() => {
                                onDeleteTransaction(t.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(t.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredTransactions.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredTransactions.length}</span> results
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold text-slate-800 dark:text-slate-200 px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
