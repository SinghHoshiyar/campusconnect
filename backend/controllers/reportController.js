const CourseAttendance = require('../models/CourseAttendance');
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Get campus-wide analytics
// @route   GET /api/reports/analytics
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Overall Attendance
    const allAttendance = await CourseAttendance.find().lean();
    let totalPresent = 0;
    let totalPossible = 0;
    
    // Per department attendance tracking
    const deptStats = {}; // { CSE: { present: 0, total: 0 } }

    const students = await User.find({ role: 'student' }).select('_id department').lean();
    const studentDeptMap = {};
    students.forEach(s => { studentDeptMap[s._id.toString()] = s.department; });

    allAttendance.forEach(session => {
      session.students.forEach(st => {
        const isPresent = st.isPresent;
        const dept = studentDeptMap[st.student.toString()] || 'Other';
        
        totalPossible++;
        if (isPresent) totalPresent++;

        if (!deptStats[dept]) deptStats[dept] = { present: 0, total: 0 };
        deptStats[dept].total++;
        if (isPresent) deptStats[dept].present++;
      });
    });

    const avgAttendance = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
    
    const formattedDeptAttendance = Object.keys(deptStats).map(dept => ({
      name: dept,
      val: `${Math.round((deptStats[dept].present / deptStats[dept].total) * 100)}%`,
      height: Math.round((deptStats[dept].present / deptStats[dept].total) * 100),
      color: getDeptColor(dept)
    })).sort((a, b) => b.height - a.height);

    // 2. Grade Distribution
    const gradeCounts = await Grade.aggregate([
      { $group: { _id: "$grade", count: { $sum: 1 } } }
    ]);
    
    const totalGrades = gradeCounts.reduce((acc, curr) => acc + curr.count, 0);
    const gradeMap = {};
    gradeCounts.forEach(g => { gradeMap[g._id] = g.count; });

    const order = ['A+', 'A', 'B+', 'B', 'C', 'P', 'F'];
    const formattedGradeDist = order.map(g => {
        const count = gradeMap[g] || 0;
        const percentage = totalGrades > 0 ? Math.round((count / totalGrades) * 100) : 0;
        return {
            name: g,
            val: `${percentage}%`,
            height: percentage * 2, // scale for UI
            color: getGradeColor(g)
        };
    });

    // 3. Avg CGPA
    const avgTotal = await Grade.aggregate([
      { $group: { _id: null, avg: { $avg: "$total" } } }
    ]);
    const avgCGPA = avgTotal[0] ? (avgTotal[0].avg / 10).toFixed(1) : "0.0";

    // 4. Course Completion
    const totalEnrollments = await Enrollment.countDocuments();
    const gradedEnrollments = await Grade.countDocuments();
    const courseCompletion = totalEnrollments > 0 ? Math.round((gradedEnrollments / totalEnrollments) * 100) : 0;

    res.json({
      avgAttendance,
      deptAttendance: formattedDeptAttendance,
      gradeDist: formattedGradeDist,
      avgCGPA,
      courseCompletion,
      energy: 72 // Optional hardcoded or calculated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function getDeptColor(dept) {
  const colors = {
    'CSE': '#00e5a0',
    'ECE': '#5b8dff',
    'Mech': '#ffc947',
    'Civil': '#c084fc',
    'IT': '#ff9f43'
  };
  return colors[dept] || '#8892a4';
}

function getGradeColor(grade) {
  const colors = {
    'A+': '#00e5a0',
    'A': '#5b8dff',
    'B+': '#ffc947',
    'B': '#c084fc',
    'C': '#ff9f43',
    'P': '#ff9f43',
    'F': '#ff6b6b'
  };
  return colors[grade] || '#8892a4';
}
