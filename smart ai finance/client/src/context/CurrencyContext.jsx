import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', label: 'Indian Rupee (₹)', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar ($)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (€)', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound (£)', locale: 'en-GB' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('finance_currency');
    return saved && CURRENCIES[saved] ? saved : 'INR';
  });

  useEffect(() => {
    localStorage.setItem('finance_currency', currency);
  }, [currency]);

  const currentCurrency = CURRENCIES[currency] || CURRENCIES.INR;

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    const sym = currentCurrency.symbol;
    const locale = currentCurrency.locale || 'en-IN';
    return `${sym}${num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCompact = (amount) => {
    const num = parseFloat(amount || 0);
    const sym = currentCurrency.symbol;
    if (Math.abs(num) >= 10000000) {
      return `${sym}${(num / 10000000).toFixed(1)}Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `${sym}${(num / 100000).toFixed(1)}L`;
    }
    if (Math.abs(num) >= 1000) {
      return `${sym}${(num / 1000).toFixed(1)}k`;
    }
    return `${sym}${num.toFixed(0)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyDetails: currentCurrency,
        formatCurrency,
        formatCompact,
        availableCurrencies: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
