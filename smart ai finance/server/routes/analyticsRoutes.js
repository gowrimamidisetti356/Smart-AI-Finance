const express = require('express');
const router = express.Router();
const { getAnalyticsSummary, getAnalyticsForecast } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/summary').get(protect, getAnalyticsSummary);
router.route('/forecast').get(protect, getAnalyticsForecast);

module.exports = router;
