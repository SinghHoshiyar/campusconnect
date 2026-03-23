const mongoose = require('mongoose');

const CourseAttendanceSchema = new mongoose.Schema({
  course: { type: String, required: true },
  date: { type: Date, default: Date.now },
  students: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    roll: String,
    name: String,
    isPresent: Boolean
  }]
}, { timestamps: true });

module.exports = mongoose.model('CourseAttendance', CourseAttendanceSchema);
