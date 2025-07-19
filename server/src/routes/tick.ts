import express, { Request, Response } from 'express';
import { tickService } from '../services/tickService';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Tick System
 *   description: Tick system management and status
 */

/**
 * @openapi
 * /api/tick/status:
 *   get:
 *     summary: Get tick system status
 *     tags: [Tick System]
 *     responses:
 *       200:
 *         description: Tick system status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isRunning:
 *                   type: boolean
 *                   description: Whether the tick system is currently running
 *                 lastTickTime:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp of the last tick
 *                 interval:
 *                   type: number
 *                   nullable: true
 *                   description: Current tick interval in milliseconds
 *             example:
 *               value:
 *                 isRunning: true
 *                 lastTickTime: "2025-01-13T06:02:29.066Z"
 *                 interval: 10000
 */
router.get('/status', (req: Request, res: Response) => {
  const status = tickService.getStatus();
  res.json(status);
});

/**
 * @openapi
 * /api/tick/start:
 *   post:
 *     summary: Start the tick system
 *     tags: [Tick System]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               intervalMs:
 *                 type: number
 *                 description: Tick interval in milliseconds (optional)
 *                 default: 10000
 *     responses:
 *       200:
 *         description: Tick system started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: object
 *       400:
 *         description: Tick system is already running
 */
router.post('/start', (req: Request, res: Response) => {
  const { intervalMs } = req.body;
  
  if (tickService.getStatus().isRunning) {
    return res.status(400).json({ 
      message: 'Tick system is already running',
      status: tickService.getStatus()
    });
  }

  const interval = intervalMs || 10000;
  tickService.startTickSystem(interval);
  
  res.json({
    message: 'Tick system started successfully',
    status: tickService.getStatus()
  });
});

/**
 * @openapi
 * /api/tick/stop:
 *   post:
 *     summary: Stop the tick system
 *     tags: [Tick System]
 *     responses:
 *       200:
 *         description: Tick system stopped successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: object
 *       400:
 *         description: Tick system is not running
 */
router.post('/stop', (req: Request, res: Response) => {
  if (!tickService.getStatus().isRunning) {
    return res.status(400).json({ 
      message: 'Tick system is not running',
      status: tickService.getStatus()
    });
  }

  tickService.stopTickSystem();
  
  res.json({
    message: 'Tick system stopped successfully',
    status: tickService.getStatus()
  });
});

export default router; 