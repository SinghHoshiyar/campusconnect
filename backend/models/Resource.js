const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Notes', 'Book', 'Research', 'Paper', 'Code', 'Other'],
    default: 'Notes' 
  },
  fileUrl: { type: String, required: true },
  course: { type: String }, // Optional course name/code
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
