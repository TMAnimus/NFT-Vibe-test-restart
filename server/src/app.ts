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
import notificationsRoutes from './routes/notifications';
import { syncNftSetsWithFiles } from './services/nftSetService';
import { tickService } from './services/tickService';
import mongoose from 'mongoose';
import auctionRoutes from './routes/auction';

const app = express();

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
app.use('/api/notifications', notificationsRoutes);
app.use('/api/auctions', auctionRoutes);

// Error-handling middleware (must be after all routes)
app.use((err: any, req: Request, res: Response, next: any) => {
    console.log('Error handler called with error:', err);
    const status = err.status && typeof err.status === 'number' ? err.status : 500;
    const message = status === 500
        ? (process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message)
        : err.message;
    // Provide both message and error for better test and debug alignment
    res.status(status).json({ message, error: err.message });
});

export default app;