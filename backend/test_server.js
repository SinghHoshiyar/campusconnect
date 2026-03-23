const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
console.log('Requiring authRoutes...');
require('./routes/authRoutes');
console.log('Requiring academicRoutes...');
require('./routes/academicRoutes');
console.log('Requiring adminRoutes...');
require('./routes/adminRoutes');
console.log('Requiring resourceRoutes...');
require('./routes/resourceRoutes');
app.get('/', (req, res) => res.send('OK'));

server.listen(5002, () => console.log('Complex Core OK'));

