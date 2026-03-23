const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  credits: {
    type: Number,
    default: 3
  },
  semester: {
    type: Number,
    default: 1
  },
  department: {
    type: String,
    enum: ['AI', 'CSE', 'ECE', 'Food tech'],
    default: 'CSE'
  },
  capacity: {
    type: Number,
    default: 60
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
