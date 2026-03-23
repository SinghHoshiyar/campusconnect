const StudentAttendance = require('../models/StudentAttendance');
const CourseAttendance = require('../models/CourseAttendance');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const CourseAssignment = require('../models/CourseAssignment');

exports.getStudentAttendance = async (req, res) => {
  try {
    const records = await StudentAttendance.find({ student: req.user._id });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseStudents = async (req, res) => {
  try {
    const { courseAssignmentId } = req.query;
    if (!courseAssignmentId) {
      return res.status(400).json({ message: 'courseAssignmentId is required' });
    }

    const enrollments = await Enrollment.find({ 
      courseAssignment: courseAssignmentId, 
      status: 'enrolled' 
    }).populate('student', 'name email rollNo');
    
    const assignment = await CourseAssignment.findById(courseAssignmentId).populate('course', 'name');
    const courseName = assignment?.course?.name || 'Unknown Course';

    const studentList = await Promise.all(enrollments.map(async (env, idx) => {
      const st = env.student;
      const att = await StudentAttendance.findOne({ student: st._id, course: courseName });
      const overall = att ? Math.round((att.attended / att.total) * 100) : 100;

      return {
        _id: st._id,
        roll: st.rollNo || 'N/A',
        name: st.name,
        overallAtt: `${overall}%`,
        isPresent: true
      };
    }));

    res.json(studentList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { course, students } = req.body; // students => [{ _id, roll, name, isPresent }]

    // Save the class session record
    const session = await CourseAttendance.create({
      course,
      students: students.map(s => ({
        student: s._id,
        roll: s.roll,
        name: s.name,
        isPresent: s.isPresent
      }))
    });

    // Update individual student totals
    for (const s of students) {
      let att = await StudentAttendance.findOne({ student: s._id, course });
      if (!att) {
        att = new StudentAttendance({ student: s._id, course, attended: 0, total: 0 });
      }
      
      att.total += 1;
      if (s.isPresent) att.attended += 1;
      
      // Calculate status based on institutional threshold (e.g. 75%)
      const pct = (att.attended / att.total) * 100;
      att.status = pct < 75 ? 'warn' : 'green';
      
      const safeToMiss = Math.floor((att.attended - (0.75 * att.total)) / 0.75);
      att.canMiss = safeToMiss > 0 ? `${safeToMiss} classes` : '0 more ⚠️';
      
      await att.save();

      // Notify the student
      const io = req.app.get('io');
      const notif = await Notification.create({
        recipient: s._id,
        sender: req.user._id,
        title: 'Attendance Logged',
        text: `You were marked ${s.isPresent ? 'Present' : 'Absent'} for ${course}`,
        type: 'attendance_marked',
        link: '/app/attendance'
      });
      if (io) {
        io.to(s._id.toString()).emit('notification', notif);
        io.to(s._id.toString()).emit('refreshData'); // Trigger dashboard refresh for student
      }
    }

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
