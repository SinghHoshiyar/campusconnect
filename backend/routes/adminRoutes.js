const express = require('express');
const router = express.Router();
const { promoteStudents, getAcademicStats, getAdminStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/academic-stats', protect, adminOnly, getAcademicStats);
router.post('/promote', protect, adminOnly, promoteStudents);

module.exports = router;
