const mongoose = require('mongoose');
const StudentAttendance = require('./models/StudentAttendance');
const CourseAttendance = require('./models/CourseAttendance');
const User = require('./models/User');
require('dotenv').config();

async function diag() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- DIAGNOSTIC ---');
  
  const users = await User.countDocuments();
  console.log('Total Users:', users);
  
  const studentAtt = await StudentAttendance.find().populate('student', 'name email');
  console.log('StudentAttendance Records:', studentAtt.length);
  studentAtt.forEach(a => {
    console.log(`- Course: ${a.course}, Student: ${a.student?.name} (${a.student?.email}), Att/Tot: ${a.attended}/${a.total}`);
  });
  
  const courseAtt = await CourseAttendance.find();
  console.log('CourseAttendance Sessions:', courseAtt.length);
  
  process.exit(0);
}

diag();
