const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseAssignment: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseAssignment' },
  course: { type: String, required: true },
  roll: String,
  mid: { type: Number, default: 0 },
  lab: { type: Number, default: 0 },
  quiz: { type: Number, default: 0 },
  others: { type: Map, of: Number, default: {} },
  total: { type: Number, default: 0 },
  grade: { type: String, default: 'F' },
  risk: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Grade', GradeSchema);
