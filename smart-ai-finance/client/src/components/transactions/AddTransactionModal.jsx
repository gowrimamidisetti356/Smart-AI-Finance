import React, { useState } from 'react';
import {
  X,
  Plus,
  Loader2,
  Coffee,
  ShoppingCart,
  CarFront,
  CreditCard,
  Briefcase,
  Film,
  HeartPulse,
  ShoppingBag,
  Calendar
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const CATEGORIES = [
  { name: 'Food', icon: Coffee, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
  { name: 'Shopping', icon: ShoppingCart, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  { name: 'Travel', icon: CarFront, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  { name: 'Bills', icon: CreditCard, color: 'text-red-500 bg-red-50 dark:bg-red-950/40' },
  { name: 'Salary', icon: Briefcase, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  { name: 'Entertainment', icon: Film, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40' },
  { name: 'Health', icon: HeartPulse, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40' },
  { name: 'Other', icon: ShoppingBag, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/40' },
];

export default function AddTransactionModal({ isOpen, onClose, onAddTransaction }) {
  const { currencyDetails } = useCurrency();
  const [type, setType] = useState('expense');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onAddTransaction({
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        category: type === 'income' && category === 'Food' ? 'Salary' : category,
        date,
      });
      setName('');
      setAmount('');
      setType('expense');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      onClose();
    } catch (err) {
      console.error("Add transaction failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#131A29] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Add New Transaction
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Record a financial transaction into your PostgreSQL database
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle: Expense vs Income */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  if (category === 'Salary') setCategory('Food');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('Salary');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Amount ({currencyDetails.symbol})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  {currencyDetails.symbol}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Description / Merchant Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Description / Merchant Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'expense' ? 'e.g., Swiggy, Amazon, Uber, Grocery Store' : 'e.g., Monthly Salary, Freelance Payment'}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate w-full text-center">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
