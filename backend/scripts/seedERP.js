const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Course = require('../models/Course');
const CourseAssignment = require('../models/CourseAssignment');
const Enrollment = require('../models/Enrollment');
const StudentAttendance = require('../models/StudentAttendance');
const CourseAttendance = require('../models/CourseAttendance');
const Grade = require('../models/Grade');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const Resource = require('../models/Resource');
const Assignment = require('../models/Assignment');
const Chat = require('../models/Chat');
const Schedule = require('../models/Schedule');

const seedERP = async () => {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    console.log('🧹 Clearing all collections...');
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      CourseAssignment.deleteMany({}),
      Enrollment.deleteMany({}),
      StudentAttendance.deleteMany({}),
      CourseAttendance.deleteMany({}),
      Grade.deleteMany({}),
      Notification.deleteMany({}),
      Announcement.deleteMany({}),
      Resource.deleteMany({}),
      Assignment.deleteMany({}),
      Chat.deleteMany({}),
      Schedule.deleteMany({})
    ]);
    console.log('✨ Database Reset Complete.');

    // 1. Seed Master Admin
    console.log('👑 Seeding Master Admin...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@campus.edu',
      password: 'adminpassword',
      role: 'admin',
      initials: 'SA',
      department: 'CSE'
    });

    // 2. Departments
    const depts = ['AI', 'CSE', 'ECE', 'Food tech'];

    // 3. Seed Professors
    console.log('🎓 Seeding Professors...');
    const professors = [];
    for (let i = 0; i < 8; i++) {
      const dept = depts[i % 4];
      const prof = await User.create({
        name: `Prof. ${['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore'][i]}`,
        email: `prof${i + 1}@campus.edu`,
        password: 'password123',
        role: 'professor',
        initials: `P${i + 1}`,
        department: dept
      });
      professors.push(prof);
    }

    // 4. Seed Academic Catalog Templates
    console.log('📚 Building Catalog Templates...');
    const courseTemplates = [
      { name: 'Basics of AI', code: 'AI101', dept: 'AI' },
      { name: 'Machine Learning', code: 'AI201', dept: 'AI' },
      { name: 'Neural Networks', code: 'AI301', dept: 'AI' },
      { name: 'Computer Vision', code: 'AI401', dept: 'AI' },
      { name: 'Intro to Programming', code: 'CS101', dept: 'CSE' },
      { name: 'Data Structures', code: 'CS201', dept: 'CSE' },
      { name: 'Operating Systems', code: 'CS301', dept: 'CSE' },
      { name: 'Cloud Computing', code: 'CS401', dept: 'CSE' },
      { name: 'Digital Electronics', code: 'EC101', dept: 'ECE' },
      { name: 'Signals & Systems', code: 'EC201', dept: 'ECE' },
      { name: 'Microprocessors', code: 'EC301', dept: 'ECE' },
      { name: 'VLSI Design', code: 'EC401', dept: 'ECE' },
      { name: 'Food Chemistry', code: 'FT101', dept: 'Food tech' },
      { name: 'Processing Tech', code: 'FT201', dept: 'Food tech' },
      { name: 'Nutrition Science', code: 'FT301', dept: 'Food tech' },
      { name: 'Quality Control', code: 'FT401', dept: 'Food tech' }
    ];

    const courses = [];
    for (const t of courseTemplates) {
      // Create courses for semesters 1-8 (alternating)
      for (let sem = 1; sem <= 8; sem++) {
        // Only seed courses that make sense for the template code's level? 
        // No, let's seed all semesters to ensure the dashboard works for everyone.
        const c = await Course.create({
          name: `${t.name} (Sem ${sem})`,
          code: `${t.code}-${sem}`,
          credits: 3 + (sem % 2),
          semester: sem,
          department: t.dept,
          capacity: 60,
          createdBy: admin._id
        });
        courses.push(c);
      }
    }

    // 5. Seed 50 Students (Systematically)
    console.log('👥 Seeding 50 Students across depts/sems...');
    const students = [];
    for (let i = 0; i < 50; i++) {
      const dept = depts[i % 4];
      const semester = (Math.floor(i / 8) % 8) + 1;
      const s = await User.create({
        name: `Student ${i + 1}`,
        email: `student${i + 1}@campus.edu`,
        password: 'password123',
        role: 'student',
        initials: `S${i + 1}`,
        department: dept,
        semester: semester,
        rollNo: `2023${(i + 1).toString().padStart(3, '0')}`,
        section: 'A'
      });
      students.push(s);
    }

    // 6. Seed Course Assignments
    console.log('🔗 Generating Course Assignments...');
    const assignments = [];
    for (const course of courses) {
      const deptProfs = professors.filter(p => p.department === course.department);
      const prof = deptProfs[Math.floor(Math.random() * deptProfs.length)];

      const assignment = await CourseAssignment.create({
        course: course._id,
        professor: prof._id,
        semester: course.semester,
        department: course.department,
        section: 'A',
        color: ['#00e5a0', '#5b8dff', '#ff6b6b', '#f9bc2c'][Math.floor(Math.random() * 4)],
        schedules: [
          { day: 'Monday', startTime: '10:00', endTime: '11:00', room: `LH-${course.semester}01` },
          { day: 'Wednesday', startTime: '11:00', endTime: '12:00', room: `LH-${course.semester}01` }
        ]
      });
      assignments.push(assignment);
    }

    // 7. Seed Enrollments
    console.log('📝 Seeding Student Enrollments...');
    for (const student of students) {
      const matchingCA = assignments.filter(a => 
        a.department === student.department && a.semester === student.semester
      );
      for (const a of matchingCA) {
        await Enrollment.create({
          student: student._id,
          courseAssignment: a._id,
          status: 'enrolled'
        });
      }
    }

    // 8. Seed Performance Data
    console.log('📅 Seeding metrics...');
    for (const student of students) {
      const studentEnrolls = await Enrollment.find({ student: student._id }).populate({
        path: 'courseAssignment',
        populate: { path: 'course' }
      });
      for (const en of studentEnrolls) {
        // Attendance
        await StudentAttendance.create({
          student: student._id,
          course: en.courseAssignment.course.name,
          attended: Math.floor(Math.random() * 20) + 10,
          total: 30
        });
        // Grades
        const g = ['A+', 'A', 'B+', 'B', 'C', 'F'][Math.floor(Math.random() * 6)];
        await Grade.create({
          student: student._id,
          courseAssignment: en.courseAssignment._id,
          course: en.courseAssignment.course.name,
          roll: student.rollNo,
          grade: g,
          mid: 0, lab: 0, quiz: 0,
          total: Math.floor(Math.random() * 30) + 70,
          risk: 'Good'
        });
      }
    }

    console.log('🚀 SEEDING COMPLETE.');
    process.exit(0);
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
    process.exit(1);
  }
};

seedERP();
