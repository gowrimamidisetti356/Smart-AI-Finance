const { pool } = require('../config/db');

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT amount, type FROM transactions WHERE user_id = $1', [req.user.id]);
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    rows.forEach(t => {
      const amount = parseFloat(t.amount);
      if (t.type === 'income') totalIncome += amount;
      else totalExpenses += amount;
    });

    res.json({
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalyticsForecast = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DATE_TRUNC('month', date)::date AS month,
              COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS income,
              COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expenses
       FROM transactions
       WHERE user_id = $1
       GROUP BY DATE_TRUNC('month', date)
       ORDER BY month DESC
       LIMIT 12`,
      [req.user.id]
    );

    const months = rows.reverse().map(row => ({
      income: Number(row.income),
      expenses: Number(row.expenses),
    }));
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
    res.status(500).json({ message: error.message });
  }
};
