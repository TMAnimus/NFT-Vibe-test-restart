import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const port = process.env.PORT || 3000;

// Swagger/OpenAPI setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NFT Trading Game API',
      version: '1.0.0',
      description: 'API documentation for the NFT Trading Game',
    },
  },
  apis: ['./src/index.ts'], // You can add more files here as your API grows
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     responses:
 *       200:
 *         description: Returns a welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the NFT Trading Game API!
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the NFT Trading Game API!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API docs available at http://localhost:${port}/api-docs`);
}); 