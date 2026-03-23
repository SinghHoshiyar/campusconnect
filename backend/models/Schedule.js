const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  day: String,
  date: String,
  isToday: { type: Boolean, default: false },
  classes: [{
    name: String,
    room: String,
    top: Number,
    height: Number,
    color: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
