import React, { useState, useMemo } from 'react';
import {
  Landmark,
  CreditCard,
  Smartphone,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
  Wallet,
  Sparkles,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import AddAccountModal from './AddAccountModal';
import { useCurrency } from '../../context/CurrencyContext';

export default function AccountsView({
  accounts = [],
  onAddAccount,
  onDeleteAccount
}) {
  const { formatCurrency } = useCurrency();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Liquidity & Credit Calculations
  const { totalLiquidity, totalCreditAvailable } = useMemo(() => {
    let liquidity = 0;
    let credit = 0;

    accounts.forEach((acc) => {
      const bal = parseFloat(acc.balance || 0);
      if (acc.type === 'bank' || acc.type === 'upi') {
        liquidity += bal;
      } else if (acc.type === 'credit') {
        credit += bal;
      }
    });

    return { totalLiquidity: liquidity, totalCreditAvailable: credit };
  }, [accounts]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Liquid Funds</span>
            <Wallet className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalLiquidity)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Across bank accounts & digital wallets</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Available Credit Limit</span>
            <CreditCard className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-purple-500 mt-2">
            {formatCurrency(totalCreditAvailable)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Total unused credit on cards</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Linked Institutions</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold font-display text-emerald-500 mt-2">
            {accounts.length} <span className="text-sm font-normal text-slate-400">Accounts</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Live connected endpoints</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Connected Cards & Accounts
          </h3>
          <p className="text-xs text-slate-400">Manage your linked banking methods and card limits</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Link New Account</span>
        </button>
      </div>

      {/* Accounts & Cards Visual Grid */}
      {accounts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">No Accounts Linked</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Connect your primary bank account, credit card, or digital wallet to track all liquidity in one view.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition-all"
          >
            Link First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => {
            const details = acc.details || {};
            const isCredit = acc.type === 'credit';
            const isBank = acc.type === 'bank';
            const isUpi = acc.type === 'upi';

            return (
              <div
                key={acc.id}
                className="group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 shadow-xl overflow-hidden hover:scale-[1.02] text-white"
                style={{
                  background: isCredit
                    ? 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)'
                    : isBank
                    ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)'
                    : 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #059669 100%)'
                }}
              >
                {/* Background Ambient Glow */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                {/* Top Row: Type Logo & Delete Button */}
                <div className="flex items-start justify-between z-10">
                  <div className="flex items-center gap-2">
                    {isCredit && <CreditCard className="w-6 h-6 text-indigo-300" />}
                    {isBank && <Landmark className="w-6 h-6 text-slate-300" />}
                    {isUpi && <Smartphone className="w-6 h-6 text-emerald-300" />}

                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      {isCredit ? (details.cardName || 'Credit Card') : isBank ? (acc.bank_name || details.bankName || 'Bank Account') : (details.upiProvider || 'UPI Handle')}
                    </span>
                  </div>

                  {deleteConfirmId === acc.id ? (
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg backdrop-blur-sm animate-fadeIn">
                      <button
                        onClick={() => {
                          onDeleteAccount(acc.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-0.5 text-white/80 text-[10px] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(acc.id)}
                      className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Unlink Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Middle: Number Masking & Chip */}
                <div className="my-6 z-10">
                  <div className="flex items-center justify-between mb-2">
                    {/* Metallic Chip Visual */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 shadow-inner flex items-center justify-center opacity-90">
                      <div className="w-6 h-4 border border-amber-600/40 rounded-sm" />
                    </div>

                    <span className="text-xs text-white/60 font-mono tracking-widest">
                      {isCredit ? `•••• •••• •••• ${details.cardNumber || '7721'}` : isBank ? `•••• •••• ${details.accountNumber || '4829'}` : (details.upiId || 'alex@wallet')}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Balance & Status */}
                <div className="flex items-end justify-between pt-2 border-t border-white/10 z-10">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-white/60 block">
                      {isCredit ? 'Available Credit' : 'Current Balance'}
                    </span>
                    <span className="text-xl font-bold font-display tracking-tight text-white">
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-white/60 block">
                      {isCredit ? 'Card Limit' : isBank ? 'Account Type' : 'Status'}
                    </span>
                    <span className="text-xs font-semibold text-white/90">
                      {isCredit ? `${formatCurrency(details.creditLimit || 5000)}` : isBank ? (details.accountType || 'Checking') : 'Verified'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAccount={onAddAccount}
      />
    </div>
  );
}
