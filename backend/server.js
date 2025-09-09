const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

// Create Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO handling
io.on('connection', (socket) => {
  console.log('✅ Client connected via Socket.IO');

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Make io accessible in routes
app.set('io', io);

// Import routes
const memberRoutes = require('./routes/member'); // Assuming you have this
const predictionRoute = require('./routes/predictionRoute');

app.use('/api/members', memberRoutes);
app.use('/api', predictionRoute);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
