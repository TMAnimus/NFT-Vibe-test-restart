import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getDb } from '../config/database';
import { User } from '../models/User';

const router = Router();

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get the profile of the currently logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 balance:
 *                   type: number
 *                 nfts:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = getDb();
    const user = await db.collection<User>('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { pin: 0 } } // Exclude the pin from the result
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 