import { createServer } from 'http';
import app from './app';
import {initWebSocket} from './lib/websocket';
// import { db } from './lib/database';

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket service
const wsService =  initWebSocket(server);

// Add WebSocket service to app for use in handlers
app.set('wsService', wsService);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Task Manager API server running on port ${PORT}`);
  console.log(`📡 WebSocket service initialized`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default server;