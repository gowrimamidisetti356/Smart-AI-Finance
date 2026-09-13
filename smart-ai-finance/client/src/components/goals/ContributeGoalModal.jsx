import React, { useState } from 'react';
import { X, Loader2, Sparkles, PiggyBank } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function ContributeGoalModal({ isOpen, onClose, goal, onContribute }) {
  const { formatCurrency, currencyDetails } = useCurrency();
  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !goal) return null;

  const current = parseFloat(goal.current_amount || goal.saved || 0);
  const target = parseFloat(goal.target_amount || goal.target || 0);
  const remaining = Math.max(0, target - current);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addAmt = parseFloat(depositAmount);
    if (!addAmt || addAmt <= 0) return;

    setIsSubmitting(true);
    try {
      const newCurrentAmount = current + addAmt;
      const status = newCurrentAmount >= target ? 'completed' : (goal.status || 'active');

      await onContribute(goal.id, {
        title: goal.title,
        targetAmount: target,
        currentAmount: newCurrentAmount,
        deadline: goal.deadline,
        status,
      });

      setDepositAmount('');
      onClose();
    } catch (err) {
      console.error("Contribute to goal error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md bg-white dark:bg-[#131A29] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Contribute to Goal
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Current Saved</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(current)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Goal Target</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(target)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <span>Remaining to Goal</span>
              <span>{formatCurrency(remaining)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Deposit / Add Amount ({currencyDetails.symbol})
            </label>
            <div className="relative">
              <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2">
                {currencyDetails.symbol}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="e.g., 2000"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick deposit chips */}
          <div className="flex items-center gap-2">
            {[500, 1000, 2500, 5000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setDepositAmount(String(val))}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                +{currencyDetails.symbol}{val}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Goal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Confirm Contribution</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
