import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { UserModel, IUser } from '../models/User';
import NFTModel from '../models/NFT';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     NFT:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the NFT
 *         displayName:
 *           type: string
 *           description: Display name of the NFT
 *         collectionName:
 *           type: string
 *           description: Name of the NFT collection
 *         colorRarity:
 *           type: string
 *           description: Rarity based on color
 *         propRarity:
 *           type: string
 *           description: Rarity based on properties
 *         blockchain:
 *           type: string
 *           description: Blockchain the NFT is on
 *         currentPrice:
 *           type: number
 *           description: Current price of the NFT
 *         marketStatus:
 *           type: string
 *           description: Current market status (e.g., Listed, Owned)
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         error:
 *           type: string
 */

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Get the profile of the currently logged-in user
 *     tags: [User]
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
 *                     $ref: '#/components/schemas/NFT'
 *             example:
 *               value:
 *                 _id: "60f7c2b8e1d2c8a1b8e1d2c8"
 *                 username: "testuser"
 *                 balance: 10000
 *                 nfts: ["nftid1", "nftid2"]
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "User not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Server error"
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Populate full NFT objects
    const nfts = await NFTModel.find({ ownerId: user._id }).lean();
    res.status(200).json({
      _id: user._id,
      username: user.username,
      balance: user.balance,
      nfts: nfts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 