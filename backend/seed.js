require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Schedule = require('./models/Schedule');
const Assignment = require('./models/Assignment');
const Grade = require('./models/Grade');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected DB for Seeding...');

    // Clear existing
    await Announcement.deleteMany({});
    await Schedule.deleteMany({});
    await Assignment.deleteMany({});
    await Grade.deleteMany({});
    
    // Ensure we have some users
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({ name: 'Dr. Vikram Singh', email: 'admin@campus.edu', password: 'password123', role: 'admin', initials: 'VS' });
    }
    
    let studentUser = await User.findOne({ role: 'student' });
    if (!studentUser) {
      studentUser = await User.create({ name: 'Aryan Kumar', email: 'aryan@campus.edu', password: 'password123', role: 'student', initials: 'AK' });
    }

    // Seed Announcements
    await Announcement.create([
      { title: 'Mid-term Exam Schedule Released', message: 'Examinations starting soon.', type: 'urgent', badgeColor: 'red', icon: '🚨', author: adminUser._id },
      { title: 'Hackathon 2026 - Registration Open', message: 'Register your team.', type: 'info', badgeColor: 'blue', icon: '📢', author: adminUser._id },
      { title: 'Library Extended Hours', message: 'Open 24/7.', type: 'success', badgeColor: 'green', icon: '✅', author: adminUser._id }
    ]);

    // Seed Schedule
    await Schedule.create([
      { day: 'Mon', date: '28', classes: [
        { name: 'DSA', room: 'R-204', top: 54, height: 81, color: '#5b8dff' },
        { name: 'SE Lab', room: 'Lab 7', top: 324, height: 81, color: '#ff6b6b' }
      ]},
      { day: 'Tue', date: '01', isToday: true, classes: [
        { name: 'DSA', room: 'R-204', top: 54, height: 81, color: '#5b8dff' },
        { name: 'ML', room: 'Lab 3', top: 162, height: 81, color: '#00e5a0' },
        { name: 'Networks', room: '', top: 270, height: 54, color: '#ffc947' }
      ]},
      { day: 'Wed', date: '02', classes: [
        { name: 'DBMS', room: 'R-301', top: 0, height: 81, color: '#c084fc' },
        { name: 'ML', room: 'Lab 3', top: 162, height: 81, color: '#00e5a0' }
      ]},
      { day: 'Thu', date: '03', classes: [
        { name: 'SE Lab', room: 'Lab 7', top: 54, height: 81, color: '#ff6b6b' },
        { name: 'DBMS', room: '', top: 216, height: 54, color: '#c084fc' }
      ]},
      { day: 'Fri', date: '04', classes: [
        { name: 'Networks', room: 'R-108', top: 54, height: 81, color: '#ffc947' },
        { name: 'DSA', room: 'R-204', top: 162, height: 81, color: '#5b8dff' }
      ]}
    ]);

    // Seed Assignments
    await Assignment.create([
      { title: 'Binary Tree Lab Report', course: 'DSA', dueDate: new Date('2026-03-03'), priority: '🔥 High', student: studentUser._id, status: 'In Progress' },
      { title: 'ML Model - Iris', course: 'Machine Learning', dueDate: new Date('2026-03-05'), priority: '⚡ Medium', student: studentUser._id, status: 'Not Started' },
      { title: 'OSI Layer Diagram', course: 'Networks', dueDate: new Date('2026-03-08'), priority: '📘 Low', student: studentUser._id, status: 'Not Started' },
      // Submitted ones
      { title: 'Sorting Algorithm Analysis', course: 'DSA', dueDate: new Date('2026-02-18'), priority: '🔥 High', student: studentUser._id, status: 'Submitted', score: '18/20', grade: 'A', submittedDate: new Date('2026-02-20') },
      { title: 'CNN Architecture Report', course: 'ML', dueDate: new Date('2026-02-13'), priority: '⚡ Medium', student: studentUser._id, status: 'Submitted', score: '16/20', grade: 'B+', submittedDate: new Date('2026-02-15') }
    ]);

    // Seed Grades
    await Grade.create([
      { student: studentUser._id, roll: 'CS005', course: 'Machine Learning', mid: 18, lab: 19, quiz: 9, total: 92, grade: 'A+', risk: '' },
      { student: studentUser._id, roll: 'CS002', course: 'Machine Learning', mid: 16, lab: 17, quiz: 8, total: 82, grade: 'A', risk: '' }
    ]);

    console.log('Seeding Complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
