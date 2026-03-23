const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  chips: {
    type: [String],
    default: undefined,
  }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
