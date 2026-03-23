const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected');
    const users = await User.find({}).select('name email role');
    console.log('--- Current Users ---');
    users.forEach(u => console.log(`[${u.role}] ${u.name} - ${u.email}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
