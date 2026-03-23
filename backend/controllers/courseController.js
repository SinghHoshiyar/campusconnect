const Course = require('../models/Course');
const CourseAssignment = require('../models/CourseAssignment');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─── Admin: Create a course ────────────────────────────────
exports.createCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create courses.' });
    }
    const { name, code, credits, semester, department, capacity } = req.body;
    const course = await Course.create({
      name, code,
      credits: credits || 3,
      semester: semester || 1,
      department: department || 'CSE',
      capacity: capacity || 60,
      createdBy: req.user._id
    });
    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course code already exists.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Update a course ────────────────────────────────
exports.updateCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only.' });
    }
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Delete a course ────────────────────────────────
exports.deleteCourse = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only.' });
    }
    // Check if course has assignments
    const assignments = await CourseAssignment.find({ course: req.params.id });
    if (assignments.length > 0) {
      return res.status(400).json({ message: 'Cannot delete course with active assignments.' });
    }
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ message: 'Course deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Get all courses ────────────────────────────────
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Assign professor to a course ───────────────────
exports.assignProfessor = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign professors.' });
    }
    const { courseId, professorId, academicYear, semester, section, schedules, color, department } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      return res.status(400).json({ message: 'Invalid professor.' });
    }

    const assignment = await CourseAssignment.create({
      course: courseId,
      professor: professorId,
      academicYear: academicYear || '2025-26',
      semester: semester || course.semester,
      section: section || 'A',
      department: department || course.department,
      schedules: schedules || [],
      color: color || '#5b8dff'
    });

    const populated = await CourseAssignment.findById(assignment._id)
      .populate('course', 'name code credits department')
      .populate('professor', 'name email');

    // Live Notification for Professor
    const io = req.app.get('io');
    const notif = await Notification.create({
      recipient: professorId,
      sender: req.user._id,
      title: 'New Course Assigned',
      text: `Admin has assigned you to ${course.name} (${course.code}) section ${section || 'A'}.`,
      type: 'course_assigned',
      link: '/app/my_classes'
    });
    if (io) {
      io.to(professorId).emit('notification', notif);
      io.to(professorId).emit('refreshData');
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Update professor assignment ────────────────────
exports.updateAssignment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only.' });
    }
    const assignment = await CourseAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('course', 'name code credits department')
      .populate('professor', 'name email');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    // Notify Professor & Enrolled Students
    const io = req.app.get('io');
    if (io) {
      // Notify Professor
      io.to(assignment.professor._id.toString()).emit('refreshData');
      
      // Notify Enrolled Students
      const enrollments = await Enrollment.find({ courseAssignment: assignment._id, status: 'enrolled' });
      enrollments.forEach(en => {
        io.to(en.student.toString()).emit('refreshData');
      });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Delete professor assignment ────────────────────
exports.deleteAssignment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only.' });
    }
    // Check for enrollments first
    const enrollments = await Enrollment.countDocuments({ courseAssignment: req.params.id, status: 'enrolled' });
    if (enrollments > 0) {
      return res.status(400).json({ message: 'Cannot delete assignment with enrolled students.' });
    }
    const assignment = await CourseAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });
    res.json({ message: 'Assignment deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── All: Get course offerings (assignments with professor) ─
exports.getAssignments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query = { 
        department: req.user.department,
        semester: req.user.semester
      };
    }

    const assignments = await CourseAssignment.find(query)
      .populate('course', 'name code credits semester department capacity')
      .populate('professor', 'name email')
      .sort({ createdAt: -1 });

    // For each assignment, count enrolled students
    const result = [];
    for (const a of assignments) {
      const enrolledCount = await Enrollment.countDocuments({
        courseAssignment: a._id,
        status: 'enrolled'
      });
      if (a.course) {
        result.push({
          ...a.toObject(),
          enrolledCount,
          isFull: a.course.capacity ? enrolledCount >= a.course.capacity : false
        });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Professor: Get my assigned courses with enrolled students ─
exports.getMyAssignments = async (req, res) => {
  try {
    if (req.user.role !== 'professor') {
      return res.status(403).json({ message: 'Professors only.' });
    }

    const assignments = await CourseAssignment.find({ professor: req.user._id })
      .populate('course', 'name code credits semester department capacity')
      .sort({ createdAt: -1 });

    const result = [];
    for (const a of assignments) {
      const enrollments = await Enrollment.find({
        courseAssignment: a._id,
        status: 'enrolled'
      }).populate('student', 'name email');

      result.push({
        ...a.toObject(),
        enrolledStudents: enrollments.map(e => e.student),
        enrolledCount: enrollments.length
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Student: Enroll in a course offering ──────────────────
exports.enrollInCourse = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll.' });
    }

    const assignment = await CourseAssignment.findById(req.params.id)
      .populate('course', 'name code capacity');
    if (!assignment) return res.status(404).json({ message: 'Course offering not found.' });

    // Check capacity
    const enrolledCount = await Enrollment.countDocuments({
      courseAssignment: assignment._id,
      status: 'enrolled'
    });
    const capacity = assignment.course?.capacity || 60;
    if (enrolledCount >= capacity) {
      return res.status(400).json({ message: 'Course is full.' });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      student: req.user._id,
      courseAssignment: assignment._id
    });
    if (existing && existing.status === 'enrolled') {
      return res.status(400).json({ message: 'Already enrolled in this course.' });
    }

    // Re-enroll if previously dropped
    if (existing && existing.status === 'dropped') {
      existing.status = 'enrolled';
      existing.enrolledAt = Date.now();
      await existing.save();
      return res.json({ message: 'Re-enrolled successfully.', enrollment: existing });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      courseAssignment: assignment._id
    });

    // Live Notification for Professor
    const io = req.app.get('io');
    const notif = await Notification.create({
      recipient: assignment.professor,
      sender: req.user._id,
      title: 'New Student Enrolled',
      text: `${req.user.name} has enrolled in your course ${assignment.course.name}.`,
      type: 'course_enrolled',
      link: '/app/my_classes'
    });
    if (io) {
      io.to(assignment.professor.toString()).emit('notification', notif);
      io.to(assignment.professor.toString()).emit('refreshData'); // Trigger dashboard refresh
    }

    res.status(201).json({ message: 'Enrolled successfully.', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Student: Drop a course ────────────────────────────────
exports.dropCourse = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can drop courses.' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      courseAssignment: req.params.id,
      status: 'enrolled'
    });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found.' });
    }

    enrollment.status = 'dropped';
    await enrollment.save();

    // Live Notification for Professor
    const a = await CourseAssignment.findById(req.params.id).populate('course', 'name');
    if (a) {
      const io = req.app.get('io');
      const notif = await Notification.create({
        recipient: a.professor,
        sender: req.user._id,
        title: 'Student Dropped Course',
        text: `${req.user.name} has dropped your course ${a.course.name}.`,
        type: 'course_dropped',
        link: '/app/my_classes'
      });
      if (io) {
        io.to(a.professor.toString()).emit('notification', notif);
        io.to(a.professor.toString()).emit('refreshData'); // Trigger dashboard refresh
      }
    }

    res.json({ message: 'Course dropped successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Student: Get my enrollments ───────────────────────────
exports.getMyEnrollments = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Students only.' });
    }

    const enrollments = await Enrollment.find({
      student: req.user._id,
      status: 'enrolled'
    }).populate({
      path: 'courseAssignment',
      populate: [
        { path: 'course', select: 'name code credits semester department' },
        { path: 'professor', select: 'name email' }
      ]
    });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: Get all professors (for dropdown) ──────────────
exports.getProfessors = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admins only.' });
    }
    const professors = await User.find({ role: 'professor' }).select('name email');
    res.json(professors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
