const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const CourseAssignment = require('./models/CourseAssignment');
const Enrollment = require('./models/Enrollment');

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Find Student 2
    const student = await User.findOne({ email: 's2@gmail.com' });
    if (!student) { console.log('Student 2 not found'); return; }

    // 2. Find Soft Computing course
    const course = await Course.findOne({ code: 'CS205' });
    if (!course) { console.log('Course CS205 not found'); return; }

    // 3. Find a professor to teach it (Dr. Alice Smith)
    const prof = await User.findOne({ role: 'professor' });
    if (!prof) { console.log('Professor not found'); return; }

    // 4. Create Assignment if not exists
    let ca = await CourseAssignment.findOne({ course: course._id });
    if (!ca) {
      ca = await CourseAssignment.create({
        course: course._id,
        professor: prof._id,
        academicYear: '2025-26',
        semester: 1,
        section: 'A',
        schedules: [],
        color: '#ff6b6b'
      });
      console.log('Created Assignment for CS205');
    }

    // 5. Enroll Student 2 if not exists
    const existing = await Enrollment.findOne({ student: student._id, courseAssignment: ca._id });
    if (!existing) {
      await Enrollment.create({
        student: student._id,
        courseAssignment: ca._id,
        status: 'enrolled'
      });
      console.log('Enrolled Student 2 in CS205');
    } else if (existing.status !== 'enrolled') {
      existing.status = 'enrolled';
      await existing.save();
      console.log('Updated Student 2 enrollment in CS205 to active');
    } else {
      console.log('Student 2 already enrolled in CS205');
    }

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

fixData();
