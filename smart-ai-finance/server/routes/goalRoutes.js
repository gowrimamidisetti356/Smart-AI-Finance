const express = require('express');
const router = express.Router();
const { getGoals, addGoal, updateGoal, deleteGoal, getGoalsProgress } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getGoals).post(protect, addGoal);
router.route('/progress').get(protect, getGoalsProgress);
router.route('/:id').put(protect, updateGoal).delete(protect, deleteGoal);

module.exports = router;
