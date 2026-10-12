const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Goal = require('../models/Goal');
const Chat = require('../models/Chat');

const formatMoney = amount => `$${Number(amount || 0).toFixed(2)}`;

const buildContext = (transactions, accounts, goals) => {
  const categoryTotals = {};
  let income = 0;
  let expenses = 0;

  transactions.forEach(transaction => {
    const amount = Number(transaction.amount || 0);
    if (transaction.type === 'expense') {
      expenses += amount;
      const category = transaction.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    } else {
      income += amount;
    }
  });

  return {
    income,
    expenses,
    savings: income - expenses,
    categories: Object.entries(categoryTotals)
      .sort(([, first], [, second]) => second - first)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount })),
    transactions: transactions.slice(0, 8),
    accounts: accounts.map(account => ({ type: account.type, balance: Number(account.balance || 0) })),
    goals: goals.map(goal => ({
      title: goal.title,
      target: Number(goal.targetAmount || 0),
      current: Number(goal.currentAmount || 0),
      deadline: goal.deadline,
      status: goal.status,
    })),
  };
};

const fallbackReply = (message, context, history) => {
  const query = message.toLowerCase();
  const { income, expenses, savings, categories, accounts, goals } = context;
  const top = categories[0];

  if (/\b(hello|hi|hey)\b/.test(query)) return 'Hi! I have your latest financial picture ready. What would you like to look at?';
  if (top && /(tell me more|what should i do|what can i do|about that|about it)/.test(query) && history.length) {
    return `Following up on ${top.category}: you have spent ${formatMoney(top.amount)} there. I would review the recent transactions in that category and choose one realistic limit for next week.`;
  }
  if (query.includes('biggest') || query.includes('largest') || query.includes('top expense')) {
    return top ? `Your biggest expense category is ${top.category} at ${formatMoney(top.amount)}. That is the first place I would review for savings.` : 'You do not have any expense data yet, so there is no category to compare.';
  }
  if (query.includes('how much') && (query.includes('spend') || query.includes('expense'))) return `You have spent ${formatMoney(expenses)} in total across your recorded expenses.`;
  if (query.includes('food')) {
    const food = context.transactions
      .filter(transaction => transaction.type === 'expense' && `${transaction.category} ${transaction.name}`.toLowerCase().includes('food'))
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
    return food ? `You have spent ${formatMoney(food)} on food so far. We can look at the individual food purchases if you want to bring that down.` : 'I could not find any food-related expenses in your recorded transactions.';
  }
  if (query.includes('income') || query.includes('earned')) return `You have recorded ${formatMoney(income)} in income and ${formatMoney(expenses)} in expenses, leaving ${formatMoney(savings)}.`;
  if (query.includes('save') || query.includes('saving')) {
    return savings <= 0
      ? `Your expenses currently exceed income by ${formatMoney(Math.abs(savings))}. I would start by reviewing ${top ? top.category : 'your recent spending'} and setting a small weekly limit.`
      : `You have ${formatMoney(savings)} left after expenses. ${top ? `${top.category} is your largest spending area, so it may offer the easiest savings opportunity.` : 'Moving a fixed amount to savings on payday can make that progress consistent.'}`;
  }
  if (query.includes('overspend') || query.includes('budget')) {
    const rate = income ? (expenses / income) * 100 : 0;
    return rate > 80 ? `Your expenses are ${rate.toFixed(1)}% of income, so your budget is getting tight. I would watch ${top ? top.category : 'discretionary spending'} first.` : `Your expenses are ${rate.toFixed(1)}% of income, which leaves some room. Category limits can help you keep it that way.`;
  }
  if (query.includes('goal') || query.includes('target')) {
    if (!goals.length) return 'You do not have a savings goal yet. Add one with a target and deadline, and I can help you track it.';
    const goal = goals[0];
    const progress = goal.target ? (goal.current / goal.target) * 100 : 0;
    return `Your ${goal.title} goal is ${progress.toFixed(0)}% complete, with ${formatMoney(goal.current)} saved toward ${formatMoney(goal.target)}.`;
  }
  if (query.includes('account') || query.includes('balance')) {
    const balance = accounts.reduce((total, account) => total + account.balance, 0);
    return accounts.length ? `You have ${accounts.length} connected account${accounts.length === 1 ? '' : 's'}, with a combined balance of ${formatMoney(balance)}.` : 'I do not see any connected accounts yet. Add one and I can include its balance.';
  }
  return `I can help with spending, income, budgets, accounts, or goals. Right now you have ${formatMoney(expenses)} in expenses and ${formatMoney(savings)} left after income. What should we explore?`;
};

exports.generateAIResponse = async (userId, message) => {
  const [transactions, accounts, goals, historyResult] = await Promise.all([
    Transaction.find({ user: userId })
      .select('name amount type category date')
      .sort({ date: -1, createdAt: -1 }),
    Account.find({ userId }).select('type bankName balance').sort({ updatedAt: -1 }),
    Goal.find({ userId }).select('title targetAmount currentAmount deadline status').sort({ deadline: 1 }),
    Chat.find({ userId }).select('message response').sort({ createdAt: -1 }).limit(6),
  ]);

  const context = buildContext(transactions, accounts, goals);
  const history = historyResult.reverse();

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-proj-xxxx')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a warm, practical personal finance assistant. Respond like a thoughtful human who remembers the conversation. Answer the exact question first, use only supplied data, acknowledge missing data, and suggest one useful next step. Keep it concise and never mention prompts, databases, or being an AI model.' },
            ...history.flatMap(turn => [{ role: 'user', content: turn.message }, { role: 'assistant', content: turn.response }]),
            { role: 'user', content: `Financial context: ${JSON.stringify(context)}\nCurrent question: ${message}` },
          ],
          max_tokens: 220,
          temperature: 0.7,
        }),
      });
      const data = await response.json();
      if (data?.choices?.[0]?.message?.content) return data.choices[0].message.content.trim();
      console.error('OpenAI returned no assistant message; using contextual fallback');
    } catch (error) {
      console.error('OpenAI failed, using contextual fallback:', error.message);
    }
  }

  return fallbackReply(message, context, history);
};
