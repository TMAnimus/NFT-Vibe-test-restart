import mongoose from 'mongoose';
import AuctionModel, { IAuction } from '../models/Auction';
import BidModel, { IBid } from '../models/Bid';
import NFTModel from '../models/NFT';
import { UserModel } from '../models/User';
import { TransactionModel } from '../models/Transaction';
import { AuctionType, AuctionStatus, MarketStatus } from '../models/enums';
import { 
  emitAuctionCreated, 
  emitBidPlaced, 
  emitAuctionEnded, 
  emitAuctionUpdated,
  emitNotification 
} from './socketService';
import fs from 'fs';
import path from 'path';
/**
 * Custom error for HTTP status codes
 */
const loadMarketplaceConfig = () => {
  const configPath = path.join(__dirname, '../config/marketplaceConfig.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
};

/**
 * Load marketplace configuration once at module level
 */
const marketplaceConfig = loadMarketplaceConfig();

/**
 * Custom error for HTTP status codes
 */
export class AuctionError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Create a new auction for an NFT
 */
export const createAuction = async (
  nftId: string, 
  sellerId: string, 
  auctionType: AuctionType,
  startingBid: number,
  duration?: number,
  reservePrice?: number
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate NFT ownership
    const nft = await NFTModel.findById(nftId).session(session);
    if (!nft) {
      throw new AuctionError('NFT not found', 404);
    }
    if (nft.ownerId?.toString() !== sellerId) {
      throw new AuctionError('User is not the owner of this NFT', 403);
    }
    if (nft.marketStatus === MarketStatus.Sold) {
      throw new AuctionError('Cannot auction a sold NFT', 400);
    }

    // Check auction limits
    const activeAuctions = await AuctionModel.countDocuments({
      sellerId,
      auctionStatus: AuctionStatus.Active
    }).session(session);
    
    if (activeAuctions >= marketplaceConfig.auctions.limits.maxActiveAuctionsPerUser) {
      throw new AuctionError('Maximum active auctions reached', 400);
    }

    // Validate auction parameters
    const config = marketplaceConfig.auctions;
    if (startingBid < config.pricing.minStartingBid || startingBid > config.pricing.maxStartingBid) {
      throw new AuctionError('Starting bid out of range', 400);
    }

    if (reservePrice && (reservePrice < config.pricing.reservePriceMin || reservePrice > config.pricing.reservePriceMax)) {
      throw new AuctionError('Reserve price out of range', 400);
    }

    const auctionDuration = duration || config.timing.defaultDuration;
    if (auctionDuration < config.timing.minDuration || auctionDuration > config.timing.maxDuration) {
      throw new AuctionError('Auction duration out of range', 400);
    }

    // Calculate end time
    const endTime = new Date(Date.now() + auctionDuration * 1000);

    // Handle auction type specific setup
    let dutchStartPrice = startingBid;
    let dutchCurrentPrice = startingBid;
    
    if (auctionType === AuctionType.Dutch) {
      dutchStartPrice = startingBid * config.dutchAuctions.defaultStartPriceMultiplier;
      dutchCurrentPrice = dutchStartPrice;
    }

    // Create auction
    const auction = new AuctionModel({
      nftId,
      sellerId,
      auctionType,
      auctionStatus: AuctionStatus.Active,
      startingBid,
      currentBid: auctionType === AuctionType.Dutch ? dutchCurrentPrice : undefined,
      reservePrice,
      startTime: new Date(),
      endTime,
      duration: auctionDuration,
      dutchStartPrice,
      dutchCurrentPrice,
      dutchPriceDecrement: auctionType === AuctionType.Dutch ? 
        (dutchStartPrice - startingBid) / (auctionDuration / config.dutchAuctions.defaultDecrementPercent) : undefined,
      dutchDecrementInterval: config.dutchAuctions.defaultDecrementPercent
    });

    await auction.save({ session });

    // Update NFT status
    nft.marketStatus = MarketStatus.Auction;
    await nft.save({ session });

    await session.commitTransaction();

    // Emit real-time event
    emitAuctionCreated(auction);

    return { 
      message: 'Auction created successfully',
      auction: {
        id: auction.id,
        auctionType: auction.auctionType,
        startingBid: auction.startingBid,
        endTime: auction.endTime,
        status: auction.auctionStatus
      }
    };

  } catch (error: any) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Place a bid on an auction
 */
export const placeBid = async (
  auctionId: string,
  bidderId: string,
  bidAmount: number,
  isAutobid: boolean = false,
  maxAutobidAmount?: number,
  autobidIncrement?: number
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get auction
    const auction = await AuctionModel.findById(auctionId).session(session);
    if (!auction) {
      throw new AuctionError('Auction not found', 404);
    }
    if (auction.auctionStatus !== AuctionStatus.Active) {
      throw new AuctionError('Auction is not active', 400);
    }
    if (auction.sellerId.toString() === bidderId) {
      throw new AuctionError('Cannot bid on your own auction', 400);
    }

    // Get bidder
    const bidder = await UserModel.findById(bidderId).session(session);
    if (!bidder) {
      throw new AuctionError('Bidder not found', 404);
    }

    // Validate bid amount based on auction type
    const config = marketplaceConfig.auctions;
    let minimumBid = auction.currentBid || auction.startingBid;

    if (auction.auctionType === AuctionType.Dutch) {
      minimumBid = Math.max(minimumBid, auction.dutchCurrentPrice || auction.startingBid);
    } else {
      minimumBid += config.pricing.bidIncrement;
    }

    if (bidAmount < minimumBid) {
      throw new AuctionError(`Minimum bid is ${minimumBid}`, 400);
    }

    if (bidder.balance < bidAmount) {
      throw new AuctionError('Insufficient funds', 400);
    }

    // Handle autobid validation
    if (isAutobid) {
      if (!maxAutobidAmount || maxAutobidAmount < bidAmount) {
        throw new AuctionError('Invalid autobid parameters', 400);
      }
      
      // Check autobid limits
      const userAutobids = await BidModel.countDocuments({
        bidderId,
        isAutobid: true,
        auctionId
      }).session(session);
      
      if (userAutobids >= config.autobid.maxAutobidsPerUser) {
        throw new AuctionError('Maximum autobids reached for this auction', 400);
      }
    }

    // Check for existing winning bid to mark as outbid
    const existingWinningBid = await BidModel.findOne({
      auctionId,
      isWinning: true
    }).session(session);

    // Create new bid
    const bid = new BidModel({
      auctionId,
      bidderId,
      bidAmount,
      isAutobid,
      maxAutobidAmount,
      autobidIncrement: autobidIncrement || config.autobid.defaultIncrement,
      bidTime: new Date(),
      isWinning: true
    });

    await bid.save({ session });

    // Update auction current bid
    auction.currentBid = bidAmount;
    auction.winningBid = bidAmount;
    auction.winnerId = bidder._id;
    auction.winningTime = new Date();
    await auction.save({ session });

    // Mark previous winning bid as outbid
    if (existingWinningBid && existingWinningBid._id.toString() !== bid._id.toString()) {
      existingWinningBid.isWinning = false;
      existingWinningBid.isOutbid = true;
      await existingWinningBid.save({ session });
      
      // Notify outbid user
      emitNotification(existingWinningBid.bidderId.toString(), {
        type: 'outbid',
        auctionId,
        bidAmount,
        message: 'You have been outbid'
      });
    }

    await session.commitTransaction();

    // Emit real-time events
    emitBidPlaced(auction, bid);
    emitAuctionUpdated(auction);

    // Notify auction owner
    emitNotification(auction.sellerId.toString(), {
      type: 'bidPlaced',
      auctionId,
      bidAmount,
      bidderId,
      message: 'New bid placed on your auction'
    });

    return { 
      message: 'Bid placed successfully',
      bid: {
        id: bid.id,
        amount: bid.bidAmount,
        isWinning: bid.isWinning
      }
    };

  } catch (error: any) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Process Dutch auction price decreases
 */
export const processDutchAuctionTick = async (auctionId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await AuctionModel.findById(auctionId).session(session);
    if (!auction || auction.auctionType !== AuctionType.Dutch || auction.auctionStatus !== AuctionStatus.Active) {
      return;
    }

    const config = marketplaceConfig.auctions.dutchAuctions;
    const timeElapsed = (Date.now() - auction.startTime.getTime()) / 1000;
    const decrementsElapsed = Math.floor(timeElapsed / config.defaultDecrementPercent);
    
    if (auction.dutchPriceDecrement && auction.dutchStartPrice) {
      const newPrice = auction.dutchStartPrice - (decrementsElapsed * auction.dutchPriceDecrement);
      const floorPrice = auction.startingBid * config.priceFloorMultiplier;
      
      auction.dutchCurrentPrice = Math.max(newPrice, floorPrice);
      
      if (auction.dutchCurrentPrice !== auction.currentBid) {
        auction.currentBid = auction.dutchCurrentPrice;
        await auction.save({ session });
        emitAuctionUpdated(auction);
      }
    }

    await session.commitTransaction();
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error processing Dutch auction tick:', error);
  } finally {
    session.endSession();
  }
};

/**
 * End an auction and process the winner
 */
export const endAuction = async (auctionId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await AuctionModel.findById(auctionId)
      .populate('nftId')
      .populate('winnerId')
      .session(session);
    
    if (!auction || auction.auctionStatus !== AuctionStatus.Active) {
      return;
    }

    // Check if auction has a winner
    const hasWinner = auction.winnerId && 
      (!auction.reservePrice || auction.winningBid! >= auction.reservePrice);

    if (hasWinner) {
      // Process winning transaction
      const winner = await UserModel.findById(auction.winnerId).session(session);
      const seller = await UserModel.findById(auction.sellerId).session(session);
      const nft = await NFTModel.findById(auction.nftId).session(session);

      if (!winner || !seller || !nft) {
        throw new AuctionError('Required entities not found', 404);
      }

      // Calculate fees
      const config = marketplaceConfig.auctions;
      const transactionFee = auction.winningBid! * config.fees.transactionFee;
      const sellerReceive = auction.winningBid! - transactionFee;

      // Process payment
      winner.balance -= auction.winningBid!;
      seller.balance += sellerReceive;

      // Transfer NFT ownership
      nft.ownerId = winner._id;
      nft.marketStatus = MarketStatus.Owned;
      nft.currentPrice = auction.winningBid!;

      // Save all changes
      await winner.save({ session });
      await seller.save({ session });
      await nft.save({ session });

      // Create transaction record
      await TransactionModel.create([{
        nftId: auction.nftId,
        buyerId: winner._id,
        sellerId: seller._id,
        price: auction.winningBid!,
        timestamp: new Date()
      }], { session });

      // Update auction
      auction.auctionStatus = AuctionStatus.Ended;
      await auction.save({ session });

      await session.commitTransaction();

      // Emit events
      emitAuctionEnded(auction, winner.username);
      
      // Notify winner
      emitNotification(winner._id.toString(), {
        type: 'auctionWon',
        auctionId,
        nftId: nft._id,
        winningBid: auction.winningBid,
        message: 'Congratulations! You won the auction'
      });

      // Notify seller
      emitNotification(seller._id.toString(), {
        type: 'auctionSold',
        auctionId,
        nftId: nft._id,
        salePrice: sellerReceive,
        message: 'Your auction has ended successfully'
      });

    } else {
      // No winner - reset NFT status back to Owned
      const nft = await NFTModel.findById(auction.nftId).session(session);
      if (nft) {
        nft.marketStatus = MarketStatus.Owned;
        await nft.save({ session });
      }

      auction.auctionStatus = AuctionStatus.Ended;
      await auction.save({ session });

      await session.commitTransaction();

      // Notify seller
      emitNotification(auction.sellerId.toString(), {
        type: 'auctionEnded',
        auctionId,
        message: 'Your auction ended without a winner'
      });
    }

  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error ending auction:', error);
  } finally {
    session.endSession();
  }
};

/**
 * Get active auctions with real-time data
 */
export const getActiveAuctions = async () => {
  return await AuctionModel.find({ 
    auctionStatus: AuctionStatus.Active,
    endTime: { $gt: new Date() }
  })
  .populate('nftId')
  .populate('sellerId', 'username')
  .populate('winnerId', 'username')
  .sort({ endTime: 1 }); // Soonest ending first
};

/**
 * Cancel an auction (seller only)
 */
export const cancelAuction = async (auctionId: string, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auction = await AuctionModel.findById(auctionId).session(session);
    if (!auction) {
      throw new AuctionError('Auction not found', 404);
    }
    
    if (auction.sellerId.toString() !== userId) {
      throw new AuctionError('Only seller can cancel auction', 403);
    }
    
    if (auction.auctionStatus !== AuctionStatus.Active) {
      throw new AuctionError('Cannot cancel ended auction', 400);
    }

    // Check if there are bids
    const bidCount = await BidModel.countDocuments({ auctionId }).session(session);
    if (bidCount > 0) {
      throw new AuctionError('Cannot cancel auction with existing bids', 400);
    }

    // Apply cancellation fee
    const seller = await UserModel.findById(userId).session(session);
    const cancelFee = marketplaceConfig.auctions.fees.cancelFee;
    
    if (seller!.balance < cancelFee) {
      throw new AuctionError('Insufficient funds for cancellation fee', 400);
    }
    
    seller!.balance -= cancelFee;

    // Reset NFT status back to Owned
    const nft = await NFTModel.findById(auction.nftId).session(session);
    if (nft) {
      nft.marketStatus = MarketStatus.Owned;
      await nft.save({ session });
    }

    auction.auctionStatus = AuctionStatus.Cancelled;
    await auction.save({ session });
    await seller!.save({ session });

    await session.commitTransaction();

    emitAuctionUpdated(auction);

    return { message: 'Auction cancelled successfully' };

  } catch (error: any) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export default {
  createAuction,
  placeBid,
  processDutchAuctionTick,
  endAuction,
  getActiveAuctions,
  cancelAuction
};