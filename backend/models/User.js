const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
  initials: { type: String, required: true },
  
  // Academic & Administrative Fields
  rollNo: { type: String, unique: true, sparse: true },
  uniRegNo: { type: String, unique: true, sparse: true },
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String, enum: ['AI', 'CSE', 'ECE', 'Food tech'], default: 'CSE' },
  semester: { type: Number, default: 1 },
  section: { type: String, default: 'A' },
  batch: { type: String }, // e.g., '2021-2025'
  status: { type: String, enum: ['active', 'passout', 'detained'], default: 'active' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
