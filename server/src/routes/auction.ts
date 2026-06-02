import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as auctionService from '../services/auctionService';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AuctionType } from '../models/enums';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Auctions
 *   description: NFT auction operations
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Auction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         nftId:
 *           $ref: '#/components/schemas/NFT'
 *           description: The NFT being auctioned (populated)
 *         sellerId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         auctionType:
 *           type: string
 *           enum: [standard, dutch, reserve]
 *           description: |
 *             - `standard`: English-style — bids increase, highest wins
 *             - `dutch`: Price decreases over time, first bidder wins
 *             - `reserve`: Hidden minimum price that must be met
 *         auctionStatus:
 *           type: string
 *           enum: [active, ended, cancelled]
 *         startingBid:
 *           type: number
 *         currentBid:
 *           type: number
 *         reservePrice:
 *           type: number
 *           description: Hidden reserve price (reserve auctions only)
 *         dutchCurrentPrice:
 *           type: number
 *           description: Current decreasing price (Dutch auctions only)
 *         endTime:
 *           type: string
 *           format: date-time
 *         winnerId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *     Bid:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         auctionId:
 *           type: string
 *         bidderId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         bidAmount:
 *           type: number
 *         isAutobid:
 *           type: boolean
 *         bidTime:
 *           type: string
 *           format: date-time
 *         isWinning:
 *           type: boolean
 *         isOutbid:
 *           type: boolean
 */

/**
 * @openapi
 * /api/auctions/active:
 *   get:
 *     summary: Get all active auctions
 *     tags: [Auctions]
 *     responses:
 *       200:
 *         description: List of active auctions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Auction'
 *       500:
 *         description: Internal server error
 */
router.get('/active', async (req: Request, res: Response) => {
  try {
    const auctions = await auctionService.getActiveAuctions();
    res.status(200).json(auctions);
  } catch (error: any) {
    console.error('Error fetching active auctions:', error);
    res.status(500).json({ message: 'Error fetching active auctions', error: error.message });
  }
});

/**
 * @openapi
 * /api/auctions/{auctionId}:
 *   get:
 *     summary: Get auction details with bids
 *     tags: [Auctions]
 *     parameters:
 *       - in: path
 *         name: auctionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction ID
 *     responses:
 *       200:
 *         description: Auction details with bid history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 auction:
 *                   $ref: '#/components/schemas/Auction'
 *                 bids:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bid'
 *       404:
 *         description: Auction not found
 *       500:
 *         description: Internal server error
 */
router.get('/:auctionId', async (req: Request, res: Response) => {
  try {
    const { auctionId } = req.params;
    
    // Import models for this route
    const BidModel = (await import('../models/Bid')).default;
    const AuctionModel = (await import('../models/Auction')).default;
    
    const auction = await AuctionModel.findById(auctionId)
      .populate('nftId')
      .populate('sellerId', 'username')
      .populate('winnerId', 'username');
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    
    const bids = await BidModel.find({ auctionId })
      .populate('bidderId', 'username')
      .sort({ bidTime: -1 });
    
    res.status(200).json({ auction, bids });
  } catch (error: any) {
    console.error('Error fetching auction details:', error);
    res.status(500).json({ message: 'Error fetching auction details', error: error.message });
  }
});

/**
 * @openapi
 * /api/auctions/my-auctions:
 *   get:
 *     summary: Get user's auctions (as seller)
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's auctions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Auction'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my-auctions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const AuctionModel = (await import('../models/Auction')).default;
    const auctions = await AuctionModel.find({ 
      sellerId: req.user!.userId 
    })
    .populate('nftId')
    .populate('winnerId', 'username')
    .sort({ createdAt: -1 });
    
    res.status(200).json(auctions);
  } catch (error: any) {
    console.error('Error fetching user auctions:', error);
    res.status(500).json({ message: 'Error fetching user auctions', error: error.message });
  }
});

/**
 * @openapi
 * /api/auctions/my-bids:
 *   get:
 *     summary: Get user's bids (as bidder)
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's bids
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   bid:
 *                     $ref: '#/components/schemas/Bid'
 *                   auction:
 *                     $ref: '#/components/schemas/Auction'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my-bids', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const BidModel = (await import('../models/Bid')).default;
    
    const bids = await BidModel.find({ 
      bidderId: req.user!.userId 
    })
    .populate('auctionId')
    .sort({ bidTime: -1 });
    
    res.status(200).json(bids);
  } catch (error: any) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({ message: 'Error fetching user bids', error: error.message });
  }
});

/**
 * @openapi
 * /api/auctions/create:
 *   post:
 *     summary: Create a new auction
 *     description: |
 *       Creates a new auction for an NFT. The NFT must have `marketStatus: Owned`.
 *       On success the NFT's `marketStatus` is set to `Auction` for the duration of the auction.
 *       When the auction ends (won, no winner, or cancelled) the NFT reverts to `Owned`.
 *     tags: [Auctions]
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
 *               - auctionType
 *               - startingBid
 *             properties:
 *               nftId:
 *                 type: string
 *                 description: ID of the NFT to auction (must have marketStatus Owned)
 *               auctionType:
 *                 type: string
 *                 enum: [standard, dutch, reserve]
 *                 description: Type of auction
 *               startingBid:
 *                 type: number
 *                 description: Starting bid amount
 *               duration:
 *                 type: number
 *                 description: Auction duration in seconds (optional, uses server default if omitted)
 *               reservePrice:
 *                 type: number
 *                 description: Hidden reserve price — reserve auctions only (optional)
 *           example:
 *             nftId: "abc123"
 *             auctionType: "standard"
 *             startingBid: 100
 *             duration: 300
 *     responses:
 *       201:
 *         description: Auction created successfully. NFT marketStatus is now `Auction`.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 auction:
 *                   $ref: '#/components/schemas/Auction'
 *       400:
 *         description: Validation error, NFT not in Owned status, or auction limits reached
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not own the NFT
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/create',
  authMiddleware,
  [
    body('nftId').isMongoId().withMessage('Valid nftId is required'),
    body('auctionType').isIn(['standard', 'dutch', 'reserve']).withMessage('Valid auction type required'),
    body('startingBid').isNumeric().withMessage('Valid starting bid required'),
    body('duration').optional().isNumeric().withMessage('Duration must be numeric'),
    body('reservePrice').optional().isNumeric().withMessage('Reserve price must be numeric')
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', error: errors.array() });
    }

    try {
      const { nftId, auctionType, startingBid, duration, reservePrice } = req.body;
      const sellerId = req.user!.userId;

      const result = await auctionService.createAuction(
        nftId,
        sellerId,
        auctionType as AuctionType,
        parseFloat(startingBid),
        duration ? parseInt(duration) : undefined,
        reservePrice ? parseFloat(reservePrice) : undefined
      );

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Error creating auction:', error);
      if (error.status) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error creating auction', error: error.message });
      }
    }
  }
);

/**
 * @openapi
 * /api/auctions/{auctionId}/bid:
 *   post:
 *     summary: Place a bid on an auction
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: auctionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bidAmount
 *             properties:
 *               bidAmount:
 *                 type: number
 *                 description: Bid amount
 *               isAutobid:
 *                 type: boolean
 *                 description: Whether this is an autobid
 *               maxAutobidAmount:
 *                 type: number
 *                 description: Maximum amount for autobid
 *               autobidIncrement:
 *                 type: number
 *                 description: Increment amount for autobid
 *           example:
 *             bidAmount: 150
 *             isAutobid: false
 *     responses:
 *       200:
 *         description: Bid placed successfully
 *       400:
 *         description: Validation error or invalid bid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Auction not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/:auctionId/bid',
  authMiddleware,
  [
    body('bidAmount').isNumeric().withMessage('Valid bid amount required'),
    body('isAutobid').optional().isBoolean().withMessage('isAutobid must be boolean'),
    body('maxAutobidAmount').optional().isNumeric().withMessage('maxAutobidAmount must be numeric'),
    body('autobidIncrement').optional().isNumeric().withMessage('autobidIncrement must be numeric')
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', error: errors.array() });
    }

    try {
      const { auctionId } = req.params;
      const { bidAmount, isAutobid, maxAutobidAmount, autobidIncrement } = req.body;
      const bidderId = req.user!.userId;

      const result = await auctionService.placeBid(
        auctionId,
        bidderId,
        parseFloat(bidAmount),
        isAutobid || false,
        maxAutobidAmount ? parseFloat(maxAutobidAmount) : undefined,
        autobidIncrement ? parseFloat(autobidIncrement) : undefined
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error placing bid:', error);
      if (error.status) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error placing bid', error: error.message });
      }
    }
  }
);

/**
 * @openapi
 * /api/auctions/{auctionId}/cancel:
 *   post:
 *     summary: Cancel an auction (seller only)
 *     description: |
 *       Cancels an active auction owned by the authenticated seller.
 *       Auctions can only be cancelled before any bids are placed.
 *       A configured cancellation fee of 0.01 is deducted from the seller balance.
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: auctionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Auction ID
 *     responses:
 *       200:
 *         description: Auction cancelled successfully; seller paid the configured 0.01 cancellation fee.
 *       400:
 *         description: Cannot cancel auction (has bids, ended auction, insufficient funds for cancellation fee, etc.)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the auction owner
 *       404:
 *         description: Auction not found
 *       500:
 *         description: Internal server error
 */
router.post('/:auctionId/cancel', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user!.userId;

    const result = await auctionService.cancelAuction(auctionId, userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error cancelling auction:', error);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error cancelling auction', error: error.message });
    }
  }
});

export default router;
