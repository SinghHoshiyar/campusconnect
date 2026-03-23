const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseAssignment',
    required: true
  },
  status: {
    type: String,
    enum: ['enrolled', 'dropped'],
    default: 'enrolled'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
