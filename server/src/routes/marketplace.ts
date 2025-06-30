import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as marketplaceService from '../services/marketplaceService';
import { authMiddleware } from '../middleware/auth'; 
import NFTModel from '../models/NFT';

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
 *         description: Filter by prop rarity. Allowed values are notPresent, common, uncommon, rare, veryRare.
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
router.get('/listed', async (req: Request, res: Response) => {
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
        res.status(500).json({ message: 'Error fetching listed NFTs', error: error.message });
    }
});

/**
 * @openapi
 * /api/marketplace/list:
 *   post:
 *     summary: List an NFT for sale
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
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { nftId, price } = req.body;
            // @ts-ignore
            const sellerId = req.user.userId; // Corrected from req.user.id

            const result = await marketplaceService.listNft(nftId, sellerId, price);
            res.status(200).json(result);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('not the owner')) {
                return res.status(401).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error listing NFT', error: error.message });
        }
    }
);

/**
 * @openapi
 * /api/marketplace/buy/{nftId}:
 *   post:
 *     summary: Buy an NFT from the marketplace
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
 *         description: Bad request (e.g., NFT not for sale, insufficient funds).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "This NFT is not for sale."
 *                 error: "Not listed"
 *       401:
 *         description: Unauthorized (e.g., trying to buy your own NFT).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "Unauthorized"
 *                 error: "Cannot buy your own NFT"
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
router.post('/buy/:nftId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { nftId } = req.params;
        // @ts-ignore
        const buyerId = req.user.userId;

        const result = await marketplaceService.buyNft(nftId, buyerId);
        res.status(200).json(result);
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes('not for sale') || error.message.includes('Insufficient funds') || error.message.includes('Cannot buy your own NFT')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error buying NFT', error: error.message });
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
 *         description: NFT not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               value:
 *                 message: "NFT not found"
 *                 error: "No NFT with that ID"
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
router.get('/suggest-price/:nftId', async (req: Request, res: Response) => {
    try {
        const { nftId } = req.params;
        const nft = await require('../models/NFT').default.findById(nftId).lean();
        if (!nft) {
            return res.status(404).json({ message: 'NFT not found' });
        }
        // For now, assume no active events
        const suggestedPrice = await marketplaceService.suggestPriceForNft(nft, []);
        res.status(200).json({ suggestedPrice });
    } catch (error: any) {
        res.status(500).json({ message: 'Error suggesting price', error: error.message });
    }
});

// We will add routes for listing, buying, and viewing NFTs here.

export default router; 