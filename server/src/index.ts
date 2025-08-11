import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './config/database';
import { syncNftSetsWithFiles } from './services/nftSetService';
import { tickService } from './services/tickService';
import mongoose from 'mongoose';
import app from './app';

// Extend Socket interface to include user data
interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

// Socket.IO authentication middleware
const authenticateSocket = (socket: AuthenticatedSocket, next: any) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    socket.userId = decoded.userId;
    socket.username = decoded.username;
    next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
};

async function startServer() {
  await connectToDatabase();

  // Ensure DB indexes match the models, which will fix the duplicate key error
  console.log('Synchronizing database indexes...');
  await mongoose.connection.syncIndexes();
  console.log('Database indexes synchronized.');

  // Sync NFT sets from files to the database on startup
  await syncNftSetsWithFiles();

  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const port = process.env.PORT || 3000;

  // Socket.IO authentication and event handlers
  io.use(authenticateSocket);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.username} connected`);

    // Join marketplace room
    socket.join('marketplace');

    // Handle marketplace events
    socket.on('joinMarketplace', () => {
      socket.join('marketplace');
      console.log(`${socket.username} joined marketplace`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.username} disconnected`);
    });
  });

  // Export io for use in other modules
  (global as any).io = io;

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`API docs available at http://localhost:${port}/api-docs`);
    console.log(`Socket.IO server ready for real-time updates`);
    
    // Start the tick system after server is ready
    const tickInterval = process.env.TICK_INTERVAL_MS ? parseInt(process.env.TICK_INTERVAL_MS) : 10000;
    tickService.startTickSystem(tickInterval);
    console.log(`Tick system started with ${tickInterval}ms interval`);
  });
}

startServer();