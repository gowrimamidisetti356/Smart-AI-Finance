const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, addTransaction);
router.route('/:id').delete(protect, deleteTransaction);

module.exports = router;
