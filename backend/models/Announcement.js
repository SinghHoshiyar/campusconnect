const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['urgent', 'info', 'success', 'warn'],
    default: 'info',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeColor: {
    type: String,
    default: 'blue',
  },
  icon: {
    type: String,
    default: '📢',
  }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
