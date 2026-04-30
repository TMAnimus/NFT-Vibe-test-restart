import express, { Request, Response } from 'express';
import { generateNft } from '../services/nftGenerationService';
import { body, validationResult } from 'express-validator';
import { Rarity } from '../models/enums';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import NFTModel from '../models/NFT';

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
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
 * /api/nft/generate:
 *   post:
 *     summary: Generate a new NFT from a specific collection
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collectionName
 *             properties:
 *               collectionName:
 *                 type: string
 *                 description: The name of the collection to generate an NFT from. Available collections include Apathetic Axolotls, Crypto Bananas, Cynical Capybaras, Distracted Degenerates, Disinterested Ducks, Crypto Lamps, Crypto Mugs, Crypto Clips, Crypto Pencils, Crypto Plants, Crypto Potatoes, Sleepy Sloths, Crypto Socks, Crypto Toast, and Crypto Toasters.
 *                 example: "Crypto Toasters"
 *                 enum: ["Apathetic Axolotls", "Crypto Bananas", "Cynical Capybaras", "Distracted Degenerates", "Disinterested Ducks", "Crypto Lamps", "Crypto Mugs", "Crypto Clips", "Crypto Pencils", "Crypto Plants", "Crypto Potatoes", "Sleepy Sloths", "Crypto Socks", "Crypto Toast", "Crypto Toasters"]
 *     responses:
 *       201:
 *         description: NFT generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NFT'
 *             example:
 *               value:
 *                 _id: "nftid123"
 *                 displayName: "Crypto Toaster #1"
 *                 collectionName: "Crypto Toasters"
 *                 colorRarity: "rare"
 *                 propRarity: "common"
 *                 blockchain: "Ethereum"
 *                 currentPrice: 100
 *                 marketStatus: "Owned"
 *                 ownerId: "60f7c2b8e1d2c8a1b8e1d2c8"
 *       400:
 *         description: Bad request (e.g., missing collectionName).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Validation error"
 *                 error: 
 *                   - msg: "collectionName is required and must be a string."
 *                     path: "collectionName"
 *                     location: "body"
 *       404:
 *         description: NFT Set collection not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "NFT Set collection not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Internal Server Error"
 */
router.post(
  '/generate',
  authMiddleware,
  [
    body('collectionName').isString().notEmpty().withMessage('collectionName is required and must be a string.'),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { collectionName } = req.body;
      const ownerId = req.user!.userId;
      const newNft = await generateNft(collectionName, ownerId);
      res.status(201).json(newNft);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
      }
      console.error('Error generating NFT:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

/**
 * @openapi
 * /api/nft/my-nfts:
 *   get:
 *     summary: Get current user's NFTs
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's NFTs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NFT'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my-nfts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const userNFTs = await NFTModel.find({ ownerId: userId })
      .populate('setId')
      .sort({ createdAt: -1 });
    
    res.status(200).json(userNFTs);
  } catch (error: any) {
    console.error('Error fetching user NFTs:', error);
    res.status(500).json({ message: 'Error fetching user NFTs', error: error.message });
  }
});

export default router; 