import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import cors from 'cors';
import { connectToDatabase } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import nftRoutes from './routes/nft';
import { syncNftSetsWithFiles } from './services/nftSetService';
import mongoose from 'mongoose';

async function startServer() {
  await connectToDatabase();

  // Ensure DB indexes match the models, which will fix the duplicate key error
  console.log('Synchronizing database indexes...');
  await mongoose.connection.syncIndexes();
  console.log('Database indexes synchronized.');

  // Sync NFT sets from files to the database on startup
  await syncNftSetsWithFiles();

  const app = express();
  const port = process.env.PORT || 3000;

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

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`API docs available at http://localhost:${port}/api-docs`);
  });
}

startServer(); 