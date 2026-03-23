const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Enrollment = require('./models/Enrollment');
const CourseAssignment = require('./models/CourseAssignment');
const Course = require('./models/Course');

async function checkSystem() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const student = await User.findOne({ email: 's2@gmail.com' });
    if (!student) {
      console.log('Student not found');
      return;
    }
    console.log('Student Name:', student.name);
    console.log('Student ID:', student._id);

    const allCA = await CourseAssignment.find().populate('course');
    console.log('--- SYSTEM ASSIGNMENTS ---');
    allCA.forEach(n => console.log(`- ${n.course?.code}: ${n.course?.name} (Assignment ID: ${n._id})`));

    const enrollments = await Enrollment.find({ student: student._id })
      .populate({
        path: 'courseAssignment',
        populate: { path: 'course' }
      });
    
    console.log('--- STUDENT 2 ENROLLMENTS (All) ---');
    console.log('Count:', enrollments.length);
    enrollments.forEach((e, i) => {
      console.log(`${i+1}: Code=${e.courseAssignment?.course?.code}, Name=${e.courseAssignment?.course?.name}, Status=${e.status}, AssignmentID=${e.courseAssignment?._id}`);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkSystem();
