const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['📘 Low', '⚡ Medium', '🔥 High'], default: '📘 Low' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Submitted'], default: 'Not Started' },
  score: { type: String, default: '' },
  grade: { type: String, default: '' },
  submittedDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
