const express = require('express');
const router = express.Router();
const { register, login, updateUserProfile, updateUserPassword } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', protect, adminOnly, register);
router.post('/login', login);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);

module.exports = router;
