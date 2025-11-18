const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });

  // Send initial connection confirmation
  socket.emit('connection-status', { 
    status: 'connected', 
    message: 'Connected to QADash real-time updates' 
  });
});

// Make io accessible to controllers
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 QADash API Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/v1/results`);
  console.log(`🔌 WebSocket server is running`);
});
