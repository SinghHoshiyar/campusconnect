const express = require('express');
const router = express.Router();
const {
  createCourse, getCourses, assignProfessor, getAssignments,
  enrollInCourse, dropCourse, getMyEnrollments, getMyAssignments,
  getProfessors, updateCourse, deleteCourse, updateAssignment, deleteAssignment
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// Admin: course catalog
router.get('/', protect, getCourses);
router.post('/', protect, adminOnly, createCourse);
router.put('/:id', protect, adminOnly, updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

// Admin: professor assignment
router.post('/assignments', protect, adminOnly, assignProfessor);
router.put('/assignments/:id', protect, adminOnly, updateAssignment);
router.delete('/assignments/:id', protect, adminOnly, deleteAssignment);
router.get('/professors', protect, adminOnly, getProfessors);

// All: browse course offerings
router.get('/assignments', protect, getAssignments);

// Professor: my assigned courses
router.get('/assignments/my', protect, getMyAssignments);

// Student: enrollment
router.post('/assignments/:id/enroll', protect, enrollInCourse);
router.post('/assignments/:id/drop', protect, dropCourse);
router.get('/enrollments/my', protect, getMyEnrollments);

module.exports = router;
