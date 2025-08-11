import NFTModel from '../models/NFT';
import { UserModel, IUser } from '../models/User';
import NFTSetModel from '../models/NFTSet';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { TransactionModel } from '../models/Transaction';
import { emitListingCreated, emitListingSold } from './socketService';

/**
 * Custom error for HTTP status codes
 */
export class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Lists an NFT for sale on the marketplace.
 * @param nftId - The ID of the NFT to list.
 * @param sellerId - The ID of the user selling the NFT.
 * @param price - The price to list the NFT for.
 */
export const listNft = async (nftId: string, sellerId: string, price: number) => {
  const nft = await NFTModel.findById(nftId);

  if (!nft) {
    throw new HttpError('NFT not found.', 404);
  }
  if (nft.ownerId?.toString() !== sellerId) {
    throw new HttpError('User is not the owner of this NFT.', 401);
  }

  nft.marketStatus = 'Listed';
  nft.currentPrice = price;

  await nft.save();

  // Emit real-time event for new listing
  emitListingCreated(nft);

  return { message: 'NFT listed successfully' };
};

/**
 * Buys an NFT from the marketplace.
 * @param nftId - The ID of the NFT to buy.
 * @param buyerId - The ID of the user buying the NFT.
 */
export const buyNft = async (nftId: string, buyerId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const nft = await NFTModel.findById(nftId).session(session).exec();
    if (!nft) {
      throw new HttpError('NFT not found.', 404);
    }
    if (nft.marketStatus !== 'Listed') {
      throw new HttpError('This NFT is not for sale.', 400);
    }

    const buyer = await UserModel.findById(buyerId).session(session).exec();
    if (!buyer) {
      throw new HttpError('Buyer not found.', 404);
    }

    if (nft.ownerId && nft.ownerId.toString() === buyerId) {
      throw new HttpError('Cannot buy your own NFT.', 400);
    }
    if (buyer.balance < nft.currentPrice) {
      throw new HttpError('Insufficient funds.', 400);
    }

    const sellerId = nft.ownerId;
    let seller = null;
    if (sellerId) {
        seller = await UserModel.findById(sellerId).session(session).exec();
        if (!seller) {
            // This case might happen if the owner user was deleted, but the NFT remains
            throw new HttpError('Seller not found.', 404);
        }
    }

    // Perform the transaction
    buyer.balance -= nft.currentPrice;
    buyer.nfts.push(nft._id as any);
    
    if (seller) {
        seller.balance += nft.currentPrice;
        seller.nfts = seller.nfts.filter(id => id.toString() !== (nft._id as any).toString());
        await seller.save({ session });
    }

    nft.ownerId = buyer._id as any;
    nft.marketStatus = 'Owned';

    // Update the basePrice of the entire set to the sale price
    await NFTSetModel.updateOne(
        { _id: nft.setId },
        { $set: { basePrice: nft.currentPrice } }
    ).session(session);

    await buyer.save({ session });
    await nft.save({ session });

    await session.commitTransaction();

    // Emit real-time event for sale
    emitListingSold(nft, buyer.username);

    return { message: `Successfully purchased NFT ${nft.collectionName} #${nft._id}` };

  } catch (error: any) {
    await session.abortTransaction();
    throw error; // Re-throw the error to be caught by the route handler
  } finally {
    session.endSession();
  }
};

/**
 * Buys quantity from a batch NFT (common/no-prop).
 * @param nftId - The ID of the batch NFT.
 * @param buyerId - The ID of the user buying from the batch.
 * @param quantity - The number of NFTs to buy from the batch.
 */
export const buyFromBatch = async ({ nftId, buyerId, quantity }: { nftId: string, buyerId: string, quantity: number }) => {
  if (quantity < 1) throw new HttpError('Quantity must be at least 1.', 400);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const nft = await NFTModel.findById(nftId).session(session).exec();
    console.debug('[buyFromBatch] fetched nft:', nft);
    if (!nft || typeof nft.batchCount !== 'number' || nft.batchCount < 1) {
      throw new HttpError('Batch NFT not found or not available.', 404);
    }
    if (nft.batchCount < quantity) {
      throw new HttpError('Not enough NFTs in batch.', 400);
    }
    const buyer = await UserModel.findById(buyerId).session(session).exec();
    console.debug('[buyFromBatch] fetched buyer:', buyer);
    if (!buyer) throw new HttpError('Buyer not found.', 404);
    const totalPrice = (nft.batchPrice || nft.currentPrice) * quantity;
    if (buyer.balance < totalPrice) throw new HttpError('Insufficient funds.', 400);
    // Deduct funds and add NFT references (could be a virtual reference for batch)
    buyer.balance -= totalPrice;
    // Optionally, track batch NFT ownership as a count in buyer.ownedNFTs
    // For now, just log the transaction
    nft.batchCount -= quantity;
    if (nft.batchCount === 0) {
      // Remove the batch listing
      await NFTModel.deleteOne({ _id: nft._id }).session(session);
    } else {
      await nft.save({ session });
    }
    await buyer.save({ session });
    // Log transaction (implement TransactionModel as needed)
    await TransactionModel.create([{
      nftId: nft._id,
      batchCount: quantity,
      buyerId: buyer._id,
      sellerId: 'system',
      price: totalPrice,
      timestamp: new Date()
    }], { session });
    await session.commitTransaction();
    return { message: `Successfully purchased ${quantity} from batch NFT ${nft.collectionName}` };
  } catch (error: any) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Sells quantity to a batch NFT (common/no-prop).
 * @param nftId - The ID of the batch NFT.
 * @param sellerId - The ID of the user selling to the batch.
 * @param quantity - The number of NFTs to sell to the batch.
 */
export const sellToBatch = async ({ nftId, sellerId, quantity }: { nftId: string, sellerId: string, quantity: number }) => {
  if (quantity < 1) throw new HttpError('Quantity must be at least 1.', 400);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const nft = await NFTModel.findById(nftId).session(session).exec();
    console.debug('[sellToBatch] fetched nft:', nft);
    if (!nft || typeof nft.batchCount !== 'number') {
      throw new HttpError('Batch NFT not found.', 404);
    }
    const seller = await UserModel.findById(sellerId).session(session).exec();
    console.debug('[sellToBatch] fetched seller:', seller);
    if (!seller) throw new HttpError('Seller not found.', 404);
    // Optionally, check that seller owns enough of this NFT type (if tracked)
    const totalPrice = (nft.batchPrice || nft.currentPrice) * quantity;
    seller.balance += totalPrice;
    nft.batchCount += quantity;
    await nft.save({ session });
    await seller.save({ session });
    // Log transaction (implement TransactionModel as needed)
    await TransactionModel.create([{
      nftId: nft._id,
      batchCount: quantity,
      buyerId: 'system',
      sellerId: seller._id,
      price: totalPrice,
      timestamp: new Date()
    }], { session });
    await session.commitTransaction();
    return { message: `Successfully sold ${quantity} to batch NFT ${nft.collectionName}` };
  } catch (error: any) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Updates prices for all listed NFTs using a random walk (-10% to +10%).
 * Returns the updated NFTs.
 */
export const updateAllListedNftPrices = async () => {
  try {
    const queryResult: any = (NFTModel as any)?.find?.({ marketStatus: 'Listed' });
    const listedNfts: any[] = typeof queryResult?.lean === 'function' ? await queryResult.lean() : [];
    const updatedNfts: any[] = [];
    for (const nft of listedNfts || []) {
      const oldPrice = nft.currentPrice || 1;
      // Random walk: -10% to +10%
      const changePercent = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1
      let newPrice = Math.max(1, Math.round(oldPrice * (1 + changePercent)));
      // Add a little satirical chaos: 1% chance of a wild swing
      if (Math.random() < 0.01) {
        const swing = (Math.random() * 2) + 1; // 1x to 3x
        newPrice = Math.round(oldPrice * swing);
      }
      // Update the document in the database (guard if method mocked away)
      if (typeof (NFTModel as any)?.findByIdAndUpdate === 'function') {
        await (NFTModel as any).findByIdAndUpdate(nft._id, { currentPrice: newPrice });
      }
      // Add to updated list
      updatedNfts.push({
        _id: nft._id,
        collectionName: nft.collectionName,
        color: nft.color,
        rarity: nft.rarity,
        props: nft.props,
        currentPrice: newPrice,
        marketStatus: nft.marketStatus
      });
    }
    return updatedNfts;
  } catch (error) {
    console.error('Error updating NFT prices:', error);
    return [];
  }
};

/**
 * Gets all NFTs currently listed for sale, with optional filtering.
 * @param filters - Optional filters for colorRarity, propRarity, blockchain, minPrice, maxPrice
 */
export const getListedNfts = async (filters: {
  colorRarity?: string;
  propRarity?: string;
  blockchain?: string;
  minPrice?: number;
  maxPrice?: number;
} = {}) => {
  const query: any = { marketStatus: 'Listed' };
  if (filters.colorRarity) query.colorRarity = filters.colorRarity;
  if (filters.propRarity) query.propRarity = filters.propRarity;
  if (filters.blockchain) query.blockchain = filters.blockchain;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.currentPrice = {};
    if (filters.minPrice !== undefined) query.currentPrice.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.currentPrice.$lte = filters.maxPrice;
    if (Object.keys(query.currentPrice).length === 0) delete query.currentPrice;
  }
  const listedNfts = await NFTModel.find(query).populate('setId').lean();
  return listedNfts;
};

/**
 * Suggests a price for an NFT based on its attributes and current config.
 * @param nft - The NFT document (must include colorRarity, propRarity, blockchain, firstOfSet, etc.)
 * @param activeEvents - Optional array of active event names (strings)
 * @returns Suggested price (number)
 */
export const suggestPriceForNft = async (nft: any, activeEvents: string[] = []) => {
  // Load config
  const configPath = path.join(__dirname, '../config/marketplaceConfig.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  let price = config.basePrice;

  // Apply color rarity multiplier
  if (nft.colorRarity && config.colorRarityMultipliers[nft.colorRarity]) {
    price *= config.colorRarityMultipliers[nft.colorRarity];
  }

  // Apply prop rarity multiplier
  if (nft.propRarity && config.propRarityMultipliers[nft.propRarity]) {
    price *= config.propRarityMultipliers[nft.propRarity];
  }

  // Apply blockchain multiplier
  if (nft.blockchain && config.blockchainMultipliers[nft.blockchain]) {
    price *= config.blockchainMultipliers[nft.blockchain];
  }

  // Apply first of set bonus
  if (nft.isFirstOfSet && config.firstOfSetBonus) {
    price *= config.firstOfSetBonus;
  }

  // Apply event multipliers (if any)
  for (const eventName of activeEvents) {
    const eventConfig = config.eventMultipliers[eventName];
    if (!eventConfig) continue;
    // Color rarity event
    if (eventConfig.colorRarity && nft.colorRarity && eventConfig.colorRarity[nft.colorRarity]) {
      price *= eventConfig.colorRarity[nft.colorRarity];
    }
    // Prop rarity event
    if (eventConfig.propRarity && nft.propRarity && eventConfig.propRarity[nft.propRarity]) {
      price *= eventConfig.propRarity[nft.propRarity];
    }
    // Blockchain event
    if (eventConfig.blockchain && nft.blockchain && eventConfig.blockchain[nft.blockchain]) {
      price *= eventConfig.blockchain[nft.blockchain];
    }
    // Generic event multiplier
    if (eventConfig.all) {
      price *= eventConfig.all;
    }
  }

  // Clamp to min price (use minPriceAfterCrash if crash event is active)
  const minPrice = activeEvents.includes('cryptoMarketCrash') && config.minPriceAfterCrash
    ? config.minPriceAfterCrash
    : config.minPrice;
  if (price < minPrice) price = minPrice;

  // Rounding
  if (config.rounding === 'nearestInteger') {
    price = Math.round(price);
  }

  return price;
};