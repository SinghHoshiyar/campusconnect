const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['assignment_new', 'assignment_submitted', 'attendance_marked', 'announcement_new', 'course_assigned', 'course_enrolled', 'course_dropped', 'system'],
    default: 'system'
  },
  link: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
