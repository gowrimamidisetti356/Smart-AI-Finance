const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

let dbInitialization;
app.use('/api', async (req, res, next) => {
  try {
    dbInitialization ||= connectDB();
    await dbInitialization;
    next();
  } catch (error) {
    dbInitialization = undefined;
    console.error('Error initializing database:', error.message);
    res.status(503).json({
      message: error.code === 'DATABASE_CONFIG'
        ? error.message
        : 'Database unavailable. Check MONGODB_URI credentials and MongoDB Atlas network access.',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const accountRoutes = require('./routes/accountRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai-assistant', aiRoutes);
app.use('/api/accounts', accountRoutes);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
