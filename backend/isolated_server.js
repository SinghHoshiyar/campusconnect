const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

console.log('Starting Single Route Test...');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

console.log('Requiring authRoutes...');
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
console.log('authRoutes mounted.');

server.listen(5002, () => {
  console.log('Server is UP on 5002');
});
