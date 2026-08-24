import React, { useState } from 'react';
import { X, Landmark, CreditCard, Smartphone, Loader2, ShieldCheck } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function AddAccountModal({ isOpen, onClose, onAddAccount }) {
  const { currencyDetails } = useCurrency();
  const [type, setType] = useState('bank'); // 'bank' | 'credit' | 'upi'
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let balance = 0;
    if (type === 'bank') balance = parseFloat(formData.currentBalance) || 0;
    if (type === 'credit') balance = parseFloat(formData.availableBalance) || 0;
    if (type === 'upi') balance = parseFloat(formData.currentBalance) || 0;

    try {
      await onAddAccount({
        type,
        bankName: type === 'bank' ? formData.bankName : null,
        details: formData,
        balance,
      });
      setFormData({});
      onClose();
    } catch (err) {
      console.error("Add account error", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#131A29] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Link Financial Account
            </h3>
            <p className="text-xs text-slate-400">Connect a bank account, credit card, or digital wallet</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Select Account Category
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'bank', label: 'Bank Account', icon: Landmark },
                { id: 'credit', label: 'Credit Card', icon: CreditCard },
                { id: 'upi', label: 'UPI / Wallet', icon: Smartphone },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setType(item.id);
                      setFormData({});
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Input Fields */}
          {type === 'bank' && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bank Name</label>
                <input
                  type="text"
                  name="bankName"
                  required
                  placeholder="e.g., HDFC Bank, SBI, ICICI, Axis Bank"
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Account Number (Last 4)</label>
                  <input
                    type="text"
                    name="accountNumber"
                    maxLength={4}
                    required
                    placeholder="•••• 4829"
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Account Type</label>
                  <select
                    name="accountType"
                    onChange={handleInputChange}
                    defaultValue="Savings"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Savings">Savings Account</option>
                    <option value="Salary">Salary Account</option>
                    <option value="Current">Current Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Current Balance ({currencyDetails.symbol})</label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                    {currencyDetails.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="currentBalance"
                    required
                    placeholder="50000.00"
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'credit' && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Card Provider / Name</label>
                <input
                  type="text"
                  name="cardName"
                  required
                  placeholder="e.g., HDFC Millennia, SBI SimplyCLICK, Axis Magnus"
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Card Number (Last 4)</label>
                  <input
                    type="text"
                    name="cardNumber"
                    maxLength={4}
                    required
                    placeholder="•••• 9182"
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Credit Limit ({currencyDetails.symbol})</label>
                  <input
                    type="number"
                    name="creditLimit"
                    required
                    placeholder="150000"
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Available Credit ({currencyDetails.symbol})</label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                    {currencyDetails.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="availableBalance"
                    required
                    placeholder="120000.00"
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {type === 'upi' && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">UPI Provider</label>
                <input
                  type="text"
                  name="upiProvider"
                  required
                  placeholder="e.g., Google Pay, PhonePe, Paytm, BHIM"
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">UPI ID / Handle</label>
                <input
                  type="text"
                  name="upiId"
                  required
                  placeholder="alex@okaxis"
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Linked Wallet Balance ({currencyDetails.symbol})</label>
                <div className="relative">
                  <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                    {currencyDetails.symbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    name="currentBalance"
                    required
                    placeholder="2500.00"
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Link Account Securely</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
