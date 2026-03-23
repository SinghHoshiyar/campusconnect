const mongoose = require('mongoose');

const StudentAttendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: String, required: true },
  attended: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  canMiss: { type: String, default: 'ok' }, // just a text field for UI mapping
  status: { type: String, default: 'green' }
}, { timestamps: true });

module.exports = mongoose.model('StudentAttendance', StudentAttendanceSchema);
