import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as marketplaceService from '../services/marketplaceService';
import { authMiddleware } from '../middleware/auth'; 
import NFTModel from '../models/NFT';
import { Rarity } from '../models/enums';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Marketplace
 *   description: NFT marketplace operations
 */

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
 * /api/marketplace/listed:
 *   get:
 *     summary: Get all NFTs listed for sale (with optional filtering)
 *     tags: [Marketplace]
 *     parameters:
 *       - in: query
 *         name: colorRarity
 *         schema:
 *           type: string
 *           enum: [common, uncommon, rare, veryRare]
 *         description: Filter by color rarity. Allowed values are common, uncommon, rare, veryRare.
 *       - in: query
 *         name: propRarity
 *         schema:
 *           type: string
 *           enum: [notPresent, common, uncommon, rare, veryRare]
 *         description: Filter by prop rarity. Allowed values are notPresent, common, uncommon, rare, veryrare.
 *       - in: query
 *         name: blockchain
 *         schema:
 *           type: string
 *           enum: [Ethereum, Polygon, Solana]
 *         description: Filter by blockchain. Allowed values are Ethereum, Polygon, Solana.
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price (inclusive).
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price (inclusive).
 *     responses:
 *       200:
 *         description: A list of NFTs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NFT'
 *             examples:
 *               example:
 *                 value:
 *                   - _id: "abc123"
 *                     displayName: "Rare Potato"
 *                     colorRarity: "rare"
 *                     propRarity: "notPresent"
 *                     blockchain: "Ethereum"
 *                     currentPrice: 150
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Error fetching listed NFTs"
 *                 error: "Database error"
 */
router.get('/listed', async (req: Request, res: Response, next: any) => {
    try {
        let minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
        let maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
        if (isNaN(minPrice as number)) minPrice = undefined;
        if (isNaN(maxPrice as number)) maxPrice = undefined;
        const filters = {
            colorRarity: req.query.colorRarity as string,
            propRarity: req.query.propRarity as string,
            blockchain: req.query.blockchain as string,
            minPrice,
            maxPrice,
        };
        const nfts = await marketplaceService.getListedNfts(filters);
        res.status(200).json(nfts);
    } catch (error: any) {
        next(error);
    }
});

/**
 * @openapi
 * /api/marketplace/list:
 *   post:
 *     summary: List an NFT for fixed-price sale
 *     description: |
 *       Lists an NFT on the fixed-price marketplace. The NFT must have `marketStatus: Owned`.
 *       NFTs with `Listed` or `Auction` status cannot be listed again.
 *       On success the NFT's `marketStatus` is set to `Listed`.
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nftId
 *               - price
 *             properties:
 *               nftId:
 *                 type: string
 *                 description: The ID of the NFT to list.
 *               price:
 *                 type: number
 *                 description: The price to list the NFT for.
 *           example:
 *             nftId: "abc123"
 *             price: 150
 *     responses:
 *       200:
 *         description: NFT listed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               value:
 *                 message: "NFT listed successfully."
 *       400:
 *         description: Bad request (e.g., validation error).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Validation error"
 *                 error: "Invalid input"
 *       401:
 *         description: Unauthorized (user does not own the NFT).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Unauthorized"
 *                 error: "User does not own the NFT"
 *       404:
 *         description: NFT not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "NFT not found."
 *                 error: "No NFT with that ID"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Error listing NFT"
 *                 error: "Database error"
 */
router.post(
    '/list',
    authMiddleware,
    [
        body('nftId').isMongoId().withMessage('A valid nftId is required.'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    ],
    async (req: Request, res: Response, next: any) => {
        const errors = validationResult(req);
        // Debug log for troubleshooting test failures
        // eslint-disable-next-line no-console
        console.log('[DEBUG] /api/marketplace/list req.body:', req.body);
        // eslint-disable-next-line no-console
        console.log('[DEBUG] /api/marketplace/list validation errors:', errors.array());
        if (!errors.isEmpty()) {
            // Only validation errors return 400
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { nftId, price } = req.body;
            // @ts-ignore
            const sellerId = req.user.userId;
            const result = await marketplaceService.listNft(nftId, sellerId, price);
            res.status(200).json(result);
        } catch (err) {
            // Pass all non-validation errors to the global error handler
            next(err);
        }
    }
);

/**
 * @openapi
 * /api/marketplace/buy/{nftId}:
 *   post:
 *     summary: Buy an NFT from the marketplace
 *     description: |
 *       Purchases a `Listed` NFT. On success the NFT's `marketStatus` is set to `Owned`
 *       and ownership transfers to the buyer.
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: nftId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the NFT to purchase.
 *     responses:
 *       200:
 *         description: NFT purchased successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               value:
 *                 message: "NFT purchased successfully."
 *       400:
 *         description: Bad request (e.g., NFT not for sale, insufficient funds, or trying to buy your own NFT).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "This NFT is not for sale."
 *                 error: "Not listed"
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Unauthorized"
 *       404:
 *         description: NFT not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "NFT not found."
 *                 error: "No NFT with that ID"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Error buying NFT"
 *                 error: "Database error"
 */
router.post('/buy/:nftId', authMiddleware, async (req: Request, res: Response, next: any) => {
    try {
        const { nftId } = req.params;
        // @ts-ignore
        const buyerId = req.user.userId;

        const result = await marketplaceService.buyNft(nftId, buyerId);
        res.status(200).json(result);
    } catch (error: any) {
        next(error);
    }
});

/**
 * @openapi
 * /api/marketplace/suggest-price/{nftId}:
 *   get:
 *     summary: Suggest a price for an NFT based on its attributes and current market config
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: nftId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the NFT to suggest a price for
 *     responses:
 *       200:
 *         description: Suggested price for the NFT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestedPrice:
 *                   type: number
 *             example:
 *               value:
 *                 suggestedPrice: 210
 *       404:
 *         description: NFT not found (e.g., invalid ID format or does not exist).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "NFT not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Error suggesting price"
 *                 error: "Calculation error"
 */
router.get('/suggest-price/:nftId', async (req: Request, res: Response, next: any) => {
    try {
        const { nftId } = req.params;
        // Query NFT; mocked model will not throw on invalid IDs in tests
        const nft = await require('../models/NFT').default.findById(nftId).lean();
        if (!nft) {
            return next({ status: 404, message: 'NFT not found' });
        }
        // For now, assume no active events
        const suggestedPrice = await marketplaceService.suggestPriceForNft(nft, []);
        res.status(200).json({ suggestedPrice });
    } catch (error: any) {
        if (error?.name === 'CastError') {
            return next({ status: 404, message: 'NFT not found' });
        }
        if (typeof error?.status !== 'number' && typeof error?.message === 'string' && /not found/i.test(error.message)) {
            return next({ status: 404, message: error.message });
        }
        next(error);
    }
});

/**
 * @openapi
 * /api/marketplace/batch-buy:
 *   post:
 *     summary: Buy quantity from a batch NFT (common/no-prop)
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nftId
 *               - quantity
 *             properties:
 *               nftId:
 *                 type: string
 *                 description: The ID of the batch NFT to buy from.
 *               quantity:
 *                 type: integer
 *                 description: Number of NFTs to buy from the batch.
 *                 minimum: 1
 *           example:
 *             nftId: "abc123"
 *             quantity: 3
 *     responses:
 *       200:
 *         description: Successfully purchased from batch NFT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request (e.g., validation error, insufficient funds, not enough in batch).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Batch NFT not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/batch-buy',
  authMiddleware,
  [
    body('nftId').isMongoId().withMessage('A valid nftId is required.'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', error: errors.array() });
    }
    try {
      const { nftId, quantity } = req.body;
      // @ts-ignore
      const buyerId = req.user.userId;
      const result = await marketplaceService.buyFromBatch({ nftId, buyerId, quantity });
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
);

/**
 * @openapi
 * /api/marketplace/batch-sell:
 *   post:
 *     summary: Sell quantity to a batch NFT (common/no-prop)
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nftId
 *               - quantity
 *             properties:
 *               nftId:
 *                 type: string
 *                 description: The ID of the batch NFT to sell to.
 *               quantity:
 *                 type: integer
 *                 description: Number of NFTs to sell to the batch.
 *                 minimum: 1
 *           example:
 *             nftId: "abc123"
 *             quantity: 2
 *     responses:
 *       200:
 *         description: Successfully sold to batch NFT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request (e.g., validation error, seller not found).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Batch NFT not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/batch-sell',
  authMiddleware,
  [
    body('nftId').isMongoId().withMessage('A valid nftId is required.'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer.'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', error: errors.array() });
    }
    try {
      const { nftId, quantity } = req.body;
      // @ts-ignore
      const sellerId = req.user.userId;
      const result = await marketplaceService.sellToBatch({ nftId, sellerId, quantity });
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message.includes('not found') && error.message.toLowerCase().includes('seller')) {
        res.status(400).json({ message: error.message });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
);

// We will add routes for listing, buying, and viewing NFTs here.

export default router; 