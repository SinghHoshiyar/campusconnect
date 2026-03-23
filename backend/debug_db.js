const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');
const CourseAssignment = require('./models/CourseAssignment');

async function debugDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const courseCount = await Course.countDocuments();
    console.log(`Total Courses: ${courseCount}`);
    
    if (courseCount > 0) {
      const sample = await Course.findOne();
      console.log('Sample Course:', JSON.stringify(sample, null, 2));
    }
    
    const assignCount = await CourseAssignment.countDocuments();
    console.log(`Total Assignments: ${assignCount}`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugDB();
