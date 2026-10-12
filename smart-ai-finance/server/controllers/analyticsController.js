const Transaction = require('../models/Transaction');

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).select('amount type');
    const totals = transactions.reduce((result, transaction) => {
      if (transaction.type === 'income') result.totalIncome += Number(transaction.amount);
      else result.totalExpenses += Number(transaction.amount);
      return result;
    }, { totalIncome: 0, totalExpenses: 0 });

    res.json({
      ...totals,
      netSavings: totals.totalIncome - totals.totalExpenses,
    });
  } catch (error) {
    console.error('Fetching analytics summary failed:', error);
    res.status(500).json({ message: 'Unable to fetch analytics summary' });
  }
};

exports.getAnalyticsForecast = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).select('amount type date');
    const monthlyTotals = new Map();

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (Number.isNaN(date.getTime())) return;

      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const totals = monthlyTotals.get(monthKey) || { income: 0, expenses: 0 };
      if (transaction.type === 'income') totals.income += Number(transaction.amount);
      else totals.expenses += Number(transaction.amount);
      monthlyTotals.set(monthKey, totals);
    });

    const months = [...monthlyTotals.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .slice(-12)
      .map(([, totals]) => totals);
    const recentMonths = months.slice(-3);
    const weights = recentMonths.map((_, index) => index + 1);
    const weightTotal = weights.reduce((total, weight) => total + weight, 0);
    const weightedAverage = key => recentMonths.reduce(
      (total, month, index) => total + month[key] * weights[index], 0
    ) / (weightTotal || 1);
    const projectedIncome = weightedAverage('income');
    const projectedExpenses = weightedAverage('expenses');
    const projectedSavings = projectedIncome - projectedExpenses;
    const expenseTrend = recentMonths.length >= 2
      ? recentMonths[recentMonths.length - 1].expenses - recentMonths[recentMonths.length - 2].expenses
      : 0;

    res.json({
      period: 'next month',
      projectedIncome: Number(projectedIncome.toFixed(2)),
      projectedExpenses: Number(projectedExpenses.toFixed(2)),
      projectedSavings: Number(projectedSavings.toFixed(2)),
      expenseTrend: Number(expenseTrend.toFixed(2)),
      monthsAnalyzed: months.length,
      confidence: months.length >= 3 ? 'High' : months.length === 2 ? 'Medium' : 'Low',
      note: months.length < 3
        ? 'This estimate is based on limited history. Add at least three months of transactions for a stronger forecast.'
        : 'Estimate uses a weighted average of your three most recent recorded months, giving more weight to recent behavior.',
    });
  } catch (error) {
    console.error('Fetching analytics forecast failed:', error);
    res.status(500).json({ message: 'Unable to fetch analytics forecast' });
  }
};
