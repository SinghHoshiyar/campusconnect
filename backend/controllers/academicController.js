const Assignment = require('../models/Assignment');
const Grade = require('../models/Grade');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const CourseAssignment = require('../models/CourseAssignment');

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const { courseAssignmentId, title, dueDate, priority } = req.body;
    
    // Find enrolled students
    const enrollments = await Enrollment.find({ 
      courseAssignment: courseAssignmentId, 
      status: 'enrolled' 
    }).populate('student', '_id name');

    const assignmentInfo = await CourseAssignment.findById(courseAssignmentId).populate('course', 'name');
    const courseName = assignmentInfo?.course?.name || 'Course';

    const io = req.app.get('io');
    const createdAssignments = [];

    for (const env of enrollments) {
      const assignment = await Assignment.create({
        title,
        course: courseName,
        dueDate,
        priority: priority || '📘 Low',
        student: env.student._id,
        status: 'Not Started'
      });
      
      const notif = await Notification.create({
        recipient: env.student._id,
        sender: req.user._id,
        title: 'New Assignment',
        text: `New assignment uploaded for ${courseName}: ${title}`,
        type: 'assignment_new',
        link: '/app/assignments'
      });

      if (io) {
        io.to(env.student._id.toString()).emit('notification', notif);
        io.to(env.student._id.toString()).emit('refreshData');
      }
      createdAssignments.push(assignment);
    }

    res.status(201).json({ message: `Created assignments for ${enrollments.length} students.`, count: enrollments.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, student: req.user._id });
    if (!assignment) return res.status(404).json({ message: 'Not found' });

    assignment.status = 'Submitted';
    assignment.submittedDate = new Date();
    await assignment.save();
    
    // Notify the professor who assigned this course
    const matchingAssignment = await CourseAssignment.findOne({ 'course.name': assignment.course }); // Rough match by name if not direct ref
    // Better: find professor from CourseAssignment if course was ID, but here it's string.
    // Let's find any assignment with this course name for now as a fallback
    const profsToNotify = await CourseAssignment.find().populate('course', 'name').populate('professor', '_id');
    const targetProf = profsToNotify.find(a => a.course.name === assignment.course)?.professor?._id;

    if (targetProf) {
      const io = req.app.get('io');
      const notif = await Notification.create({
        recipient: targetProf,
        sender: req.user._id,
        title: 'Assignment Submitted',
        text: `${req.user.name} submitted assignment: ${assignment.title}`,
        type: 'assignment_submitted',
        link: '/app/assignments'
      });
      if (io) {
        io.to(targetProf.toString()).emit('notification', notif);
        io.to(targetProf.toString()).emit('refreshData');
      }
    }
    
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { courseName, title } = req.query;
    if (!courseName || !title) return res.status(400).json({ message: 'Missing courseName or title' });

    const submissions = await Assignment.find({ course: courseName, title }).populate('student', 'name email');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.gradeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    const assignment = await Assignment.findById(id).populate('student', '_id');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    assignment.grade = grade;
    assignment.feedback = feedback;
    assignment.status = 'Graded';
    await assignment.save();

    // Notify the student
    const io = req.app.get('io');
    const notif = await Notification.create({
      recipient: assignment.student._id,
      sender: req.user._id,
      title: 'Assignment Graded',
      text: `Your assignment "${assignment.title}" for ${assignment.course} has been graded: ${grade}`,
      type: 'assignment_graded',
      link: '/app/assignments'
    });

    if (io) {
      io.to(assignment.student._id.toString()).emit('notification', notif);
      io.to(assignment.student._id.toString()).emit('refreshData');
    }

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGrades = async (req, res) => {
  try {
    const { courseAssignmentId } = req.query;
    let query = {};

    if (courseAssignmentId) {
      query.courseAssignment = courseAssignmentId;
    } else if (req.user.role === 'professor') {
      const myAssignments = await CourseAssignment.find({ professor: req.user._id });
      query.courseAssignment = { $in: myAssignments.map(a => a._id) };
    } else if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    const grades = await Grade.find(query)
      .populate('student', 'name email rollNo')
      .populate({
        path: 'courseAssignment',
        populate: { path: 'course', select: 'name code' }
      });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { mid, lab, quiz, others, total: manualTotal } = req.body;

    const g = await Grade.findById(id);
    if (!g) return res.status(404).json({ message: 'Grade record not found' });

    if (mid !== undefined) g.mid = mid;
    if (lab !== undefined) g.lab = lab;
    if (quiz !== undefined) g.quiz = quiz;
    if (others !== undefined) g.others = others;

    // Calculate total or use manual override
    if (manualTotal !== undefined) {
      g.total = manualTotal;
    } else {
      const otherSum = others ? Object.values(others).reduce((a, b) => a + (Number(b) || 0), 0) : 0;
      const sum = (g.mid || 0) + (g.lab || 0) + (g.quiz || 0) + otherSum;
      // If we have custom fields, we might not want to scale by 2. 
      // User said "total marks field is also editable", so manualTotal handles it.
      g.total = sum; 
    }

    // Grade logic (assuming 100 scale for letter grades)
    const t = g.total;
    g.grade = t >= 90 ? 'A+' : t >= 80 ? 'A' : t >= 70 ? 'B+' : t >= 60 ? 'B' : t >= 50 ? 'C' : 'F';
    g.risk = t < 50 ? 'Critical' : t < 70 ? 'At Risk' : 'Good';

    await g.save();

    const io = req.app.get('io');
    if (io) io.emit('refreshData'); 

    res.json(g);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
