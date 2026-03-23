const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/analytics', protect, adminOnly, getAnalytics);

module.exports = router;
