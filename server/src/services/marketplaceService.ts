import NFTModel from '../models/NFT';
import { UserModel, IUser } from '../models/User';
import NFTSetModel from '../models/NFTSet';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

/**
 * Lists an NFT for sale on the marketplace.
 * @param nftId - The ID of the NFT to list.
 * @param sellerId - The ID of the user selling the NFT.
 * @param price - The price to list the NFT for.
 */
export const listNft = async (nftId: string, sellerId: string, price: number) => {
  const nft = await NFTModel.findById(nftId);

  if (!nft) {
    throw new Error('NFT not found.');
  }

  if (nft.ownerId?.toString() !== sellerId) {
    throw new Error('User is not the owner of this NFT.');
  }

  nft.marketStatus = 'Listed';
  nft.currentPrice = price;

  await nft.save();

  return { message: `NFT ${nft.collectionName} #${nft._id} listed for sale.` };
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
    const nft = await NFTModel.findById(nftId).session(session);
    if (!nft) {
      throw new Error('NFT not found.');
    }
    if (nft.marketStatus !== 'Listed') {
      throw new Error('This NFT is not for sale.');
    }

    const buyer = await UserModel.findById(buyerId).session(session);
    if (!buyer) {
      throw new Error('Buyer not found.');
    }

    if (nft.ownerId && nft.ownerId.toString() === buyerId) {
      throw new Error('Cannot buy your own NFT.');
    }
    
    if (buyer.balance < nft.currentPrice) {
      throw new Error('Insufficient funds.');
    }
    
    const sellerId = nft.ownerId;
    let seller = null;
    if (sellerId) {
        seller = await UserModel.findById(sellerId).session(session);
        if (!seller) {
            // This case might happen if the owner user was deleted, but the NFT remains
            throw new Error('Seller not found.');
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
    return { message: `Successfully purchased NFT ${nft.collectionName} #${nft._id}` };

  } catch (error: any) {
    await session.abortTransaction();
    throw error; // Re-throw the error to be caught by the route handler
  } finally {
    session.endSession();
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
  if (nft.firstOfSet && config.firstOfSetBonus) {
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