const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const faculty = await User.countDocuments({ role: 'professor' });
    const courses = await Course.countDocuments();
    
    res.json({ users, students, faculty, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Promote students in a batch/department to next semester
// @route   POST /api/admin/promote
exports.promoteStudents = async (req, res) => {
  try {
    const { batch, department } = req.body;
    
    if (!batch || !department) {
      return res.status(400).json({ message: 'Batch and Department are required for promotion.' });
    }

    // Update all active students in that batch/dept: semester = semester + 1
    const result = await User.updateMany(
      { 
        role: 'student', 
        batch, 
        department, 
        status: 'active' 
      },
      { $inc: { semester: 1 } }
    );

    res.json({ 
      message: `Promotion successful. ${result.modifiedCount} students promoted.`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique batches and departments for filters
// @route   GET /api/admin/academic-stats
exports.getAcademicStats = async (req, res) => {
  try {
    const batches = await User.distinct('batch', { role: 'student' });
    const departments = await User.distinct('department');
    
    res.json({ batches, departments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
