import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import nftRoutes from './routes/nft';
import marketplaceRoutes from './routes/marketplace';
import tickRoutes from './routes/tick';
import { syncNftSetsWithFiles } from './services/nftSetService';
import { tickService } from './services/tickService';
import mongoose from 'mongoose';

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

  const app = express();
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

  // Swagger/OpenAPI setup - MUST come before express.static
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'NFT Trading Game API',
        version: '1.0.0',
        description: 'API documentation for the NFT Trading Game',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/index.ts', './src/routes/*.ts'], // Scan all files in the routes folder
  };
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Middleware
  app.use(cors()); // Enable CORS for all routes
  app.use(express.static(path.join(__dirname, '../../client')));
  app.use(express.json());

  // API Routes - All prefixed with /api
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/nft', nftRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/tick', tickRoutes);

  // Error-handling middleware (must be after all routes)
  app.use((err: any, req: Request, res: Response, next: any) => {
    const status = err.status && typeof err.status === 'number' ? err.status : 500;
    const message = status === 500
      ? (process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message)
      : err.message;
    // Provide both message and error for better test and debug alignment
    res.status(status).json({ message, error: err.message });
  });

  /**
   * @openapi
   * /api:
   *   get:
   *     summary: Welcome endpoint
   *     responses:
   *       200:
   *         description: Welcome message
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Welcome to the NFT Trading Game API!
   */
  app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the NFT Trading Game API!' });
  });

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