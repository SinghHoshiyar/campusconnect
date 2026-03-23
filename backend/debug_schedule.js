const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const CourseAssignment = require('./models/CourseAssignment');
const Enrollment = require('./models/Enrollment');
const CourseAttendance = require('./models/CourseAttendance');
const Grade = require('./models/Grade');
const Notification = require('./models/Notification');
const Announcement = require('./models/Announcement');
const Resource = require('./models/Resource');
const Assignment = require('./models/Assignment');
const Chat = require('./models/Chat');
const Schedule = require('./models/Schedule');
const StudentAttendance = require('./models/StudentAttendance');

async function debugSchedule() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const student = await User.findOne({ email: 's2@gmail.com' });
    if (!student) { console.log('Student not found'); return; }
    console.log('Student:', student.name, 'Sem:', student.semester);

    const enrollments = await Enrollment.find({
        student: student._id,
        status: 'enrolled'
      }).populate({
        path: 'courseAssignment',
        populate: { path: 'course' }
      });
    
    console.log('Enrollments found:', enrollments.length);

    const assignments = enrollments
        .map(e => e.courseAssignment)
        .filter(Boolean);
    
    console.log('Assignments with schedules:', assignments.length);

    assignments.forEach((a, i) => {
      console.log(`${i+1}: ${a.course?.name} - Schedules:`, JSON.stringify(a.schedules));
    });

    // Simulate the logic in scheduleRoutes.js
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    assignments.forEach(a => {
        if (a.schedules && a.schedules.length > 0) {
          a.schedules.forEach(slot => {
             console.log(`Checking slot: ${slot.day} ${slot.startTime}`);
             days.forEach(dayStr => {
                if (slot.day === dayStr || slot.day.startsWith(dayStr)) {
                    console.log(`  MATCHED ${dayStr}`);
                }
             });
          });
        }
    });

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

debugSchedule();
