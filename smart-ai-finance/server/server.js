const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize MongoDB connection once and reuse it.
let dbInitialization;

const initializeDB = () => {
  if (!dbInitialization) {
    dbInitialization = connectDB().catch((error) => {
      dbInitialization = undefined;
      throw error;
    });
  }

  return dbInitialization;
};

// Ensure MongoDB is connected before handling API requests.
app.use('/api', async (req, res, next) => {
  try {
    await initializeDB();
    next();
  } catch (error) {
    console.error('Error initializing database:', error.message);

    return res.status(503).json({
      message:
        error.code === 'DATABASE_CONFIG'
          ? error.message
          : 'Database unavailable. Check MONGODB_URI credentials and MongoDB Atlas network access.',
    });
  }
});

// Health check: report the actual MongoDB connection state.
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  return res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: connected ? 'connected' : 'disconnected',
  });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const accountRoutes = require('./routes/accountRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai-assistant', aiRoutes);
app.use('/api/accounts', accountRoutes);

const PORT = process.env.PORT || 5000;

// Local development: verify MongoDB before starting the server.
// Vercel can initialize the connection through the API middleware above.
if (require.main === module) {
  initializeDB()
    .then(() => {
      console.log('MongoDB connected successfully');

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      process.exitCode = 1;
    });
}

module.exports = app;
