import express, { Request, Response } from 'express';
import { generateNft } from '../services/nftGenerationService';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * @openapi
 * /api/nft/generate:
 *   post:
 *     summary: Generate a new NFT from a specific collection
 *     tags: [NFT]
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
 *                 description: The name of the collection to generate an NFT from.
 *                 example: "Crypto Toasters"
 *     responses:
 *       201:
 *         description: NFT generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NFT'
 *       400:
 *         description: Bad request (e.g., missing collectionName).
 *       404:
 *         description: NFT Set collection not found.
 *       500:
 *         description: Internal server error.
 */
router.post(
  '/generate',
  [
    body('collectionName').isString().notEmpty().withMessage('collectionName is required and must be a string.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { collectionName } = req.body;
      const newNft = await generateNft(collectionName);
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

export default router; 