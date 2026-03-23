const mongoose = require('mongoose');

const courseAssignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    default: '2025-26'
  },
  semester: {
    type: Number,
    default: 1
  },
  section: {
    type: String,
    default: 'A'
  },
  department: {
    type: String,
    enum: ['AI', 'CSE', 'ECE', 'Food tech'],
    default: 'CSE'
  },
  scheduleStr: {
    type: String
  },
  room: {
    type: String
  },
  schedules: [{
    day: { type: String, required: true }, // 'Mon', 'Tue', etc.
    startTime: { type: String, required: true }, // '09:00'
    endTime: { type: String, required: true }, // '10:00'
    room: { type: String }
  }],
  color: {
    type: String,
    default: '#5b8dff'
  }
}, { timestamps: true });

module.exports = mongoose.model('CourseAssignment', courseAssignmentSchema);
