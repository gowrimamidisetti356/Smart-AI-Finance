
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');

const app = express();

// ----------------------------------------------------
// CORS CONFIGURATION
// ----------------------------------------------------
const allowedOrigins = [
  'https://smart-ai-finance-vyix.vercel.app',
  'http://localhost:5173',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as local
    // scripts and server-to-server requests.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Register CORS before API routes and database middleware.
// The cors middleware handles browser OPTIONS preflight requests.
app.use(cors(corsOptions));

app.use(express.json());

// ----------------------------------------------------
// ROOT ROUTE
// ----------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Smart AI Finance API is running',
    status: 'OK',
    health: '/api/health',
  });
});

// ----------------------------------------------------
// MONGODB CONNECTION
// ----------------------------------------------------
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

// Connect to MongoDB before handling API requests.
// CORS preflight requests are handled above this middleware.
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

// ----------------------------------------------------
// HEALTH CHECK
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  return res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: connected ? 'connected' : 'disconnected',
  });
});

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const accountRoutes = require('./routes/accountRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/ai-assistant', aiRoutes);
app.use('/api/accounts', accountRoutes);

// ----------------------------------------------------
// NOT FOUND HANDLER
// ----------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

// ----------------------------------------------------
// LOCAL DEVELOPMENT SERVER
// ----------------------------------------------------
const PORT = process.env.PORT || 5000;

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

// Export Express app for the Vercel function entry point.
module.exports = app;
