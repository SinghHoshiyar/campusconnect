const express = require('express');
const router = express.Router();
const CourseAssignment = require('../models/CourseAssignment');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    let assignments;

    if (req.user.role === 'professor') {
      assignments = await CourseAssignment.find({ professor: req.user._id })
        .populate('course', 'name code');
    } else if (req.user.role === 'student') {
      const enrollments = await Enrollment.find({
        student: req.user._id,
        status: 'enrolled'
      }).populate({
        path: 'courseAssignment',
        populate: { path: 'course', select: 'name code' }
      });
      assignments = enrollments
        .map(e => e.courseAssignment)
        .filter(Boolean);
    } else {
      assignments = await CourseAssignment.find()
        .populate('course', 'name code');
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const distanceToMonday = today.getDay() === 0 ? -6 : 1 - today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const START_HOUR = 8; // 8 AM
    const HOUR_HEIGHT = 60; // 1 min = 1px

    const weekSchedule = [];

    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayStr = days[d.getDay()];
      const dayClasses = [];

      assignments.forEach(a => {
        if (a.schedules && a.schedules.length > 0) {
          a.schedules.forEach(slot => {
            if (slot.day === dayStr || slot.day.startsWith(dayStr)) {
              // Precise calculation based on minutes
              const [sH, sM] = slot.startTime.split(':').map(Number);
              const [eH, eM] = slot.endTime.split(':').map(Number);
              
              const startInMinutes = sH * 60 + sM;
              const endInMinutes = eH * 60 + eM;
              const baseInMinutes = START_HOUR * 60;

              // Only show if it fits in 8AM - 6PM (10 hours = 600px range)
              if (sH >= START_HOUR && sH < 18) {
                dayClasses.push({
                  name: a.course?.name || 'Course',
                  room: slot.room || 'TBD',
                  top: startInMinutes - baseInMinutes,
                  height: endInMinutes - startInMinutes,
                  color: a.color || '#5b8dff',
                  startTime: slot.startTime,
                  endTime: slot.endTime
                });
              }
            }
          });
        }
      });

      weekSchedule.push({
        day: dayStr,
        date: d.getDate().toString().padStart(2, '0'),
        isToday: d.toDateString() === today.toDateString(),
        classes: dayClasses
      });
    }

    res.json(weekSchedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
