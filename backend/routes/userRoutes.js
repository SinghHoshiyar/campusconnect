const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');
const { adminUpdateUser, adminDeleteUser } = require('../controllers/authController');

const Enrollment = require('../models/Enrollment');
const CourseAssignment = require('../models/CourseAssignment');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    
    // Populate courses based on role
    const processedUsers = await Promise.all(users.map(async (u) => {
      if (u.role === 'student') {
        const enrollments = await Enrollment.find({ student: u._id, status: 'enrolled' })
          .populate({
            path: 'courseAssignment',
            populate: { path: 'course' }
          });
        u.enrolledCourses = enrollments
          .map(e => e.courseAssignment?.course?.name)
          .filter(Boolean);
      } else if (u.role === 'professor') {
        const assignments = await CourseAssignment.find({ professor: u._id })
          .populate('course');
        u.enrolledCourses = assignments
          .map(a => a.course?.name)
          .filter(Boolean);
      }
      return u;
    }));
    
    res.json(processedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, adminUpdateUser);
router.delete('/:id', protect, adminOnly, adminDeleteUser);

module.exports = router;
