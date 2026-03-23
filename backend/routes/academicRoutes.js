const express = require('express');
const router = express.Router();
const { getAssignments, submitAssignment, getGrades, createAssignment, getAssignmentSubmissions, gradeAssignment } = require('../controllers/academicController');
const { getStudentAttendance, getCourseStudents, markAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/assignments', protect, getAssignments);
router.get('/assignments/submissions', protect, getAssignmentSubmissions);
router.post('/assignments', protect, createAssignment);
router.put('/assignments/:id/submit', protect, submitAssignment);
router.put('/assignments/:id/grade', protect, gradeAssignment);

router.get('/grades', protect, getGrades);
router.put('/grades/:id', protect, require('../controllers/academicController').updateGrade);

router.get('/attendance/student', protect, getStudentAttendance);
router.get('/attendance/course', protect, getCourseStudents);
router.post('/attendance/mark', protect, markAttendance);

module.exports = router;
