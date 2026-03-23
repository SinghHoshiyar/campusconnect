const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = 5000; // Standard ERP port
app.set('io', io);

// Basic socket logic
io.on('connection', (socket) => {
  socket.on('joinRoom', (userId) => socket.join(userId));
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/academic', require('./routes/academicRoutes'));
app.use('/api/schedule', require('./routes/scheduleRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully.'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.log('💡 TIP: It looks like your MongoDB server is not running. Please start it or use the docker-compose.yml in the root.');
    }
  });

app.get('/', (req, res) => res.send('Campus Connect API - Running'));

server.listen(PORT, () => {
  console.log(`🚀 Server is live on port ${PORT}`);
});
