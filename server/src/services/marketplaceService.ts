import NFTModel from '../models/NFT';
import { UserModel, IUser } from '../models/User';
import NFTSetModel from '../models/NFTSet';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { TransactionModel } from '../models/Transaction';
import { emitListingCreated, emitListingSold } from './socketService';
import { MarketStatus } from '../models/enums';

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

  nft.marketStatus = MarketStatus.Listed;
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
    if (nft.marketStatus !== MarketStatus.Listed) {
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
    nft.marketStatus = MarketStatus.Owned;

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
 * Market sentiment data for price calculations
 */
export interface MarketSentiment {
  globalSentiment: number; // -1 to 1 (bear to bull)
  collectionSentiment: { [collectionName: string]: number };
  npcActivityLevel: number; // 0 to 1 (low to high NPC activity)
  activeEvents: string[]; // Current market events
}

/**
 * Updates prices for all listed NFTs using sophisticated market simulation.
 * @param marketSentiment - Current market sentiment data
 * @returns The updated NFTs
 */
export const updateAllListedNftPrices = async (marketSentiment?: MarketSentiment) => {
  try {
    const queryResult: any = (NFTModel as any)?.find?.({ marketStatus: MarketStatus.Listed });
    const listedNfts: any[] = typeof queryResult?.lean === 'function' ? await queryResult.lean() : [];
    
    // Ensure listedNfts is always an array
    const safeListedNfts = Array.isArray(listedNfts) ? listedNfts : [];
    
    const updatedNfts: any[] = [];
    for (const nft of safeListedNfts) {
      const oldPrice = nft.currentPrice || 1;
      let newPrice = oldPrice;
      
      // Base market movement (-5% to +5%)
      const baseChange = (Math.random() * 0.1) - 0.05;
      let totalMultiplier = 1 + baseChange;
      
      // Apply market sentiment if provided
      if (marketSentiment) {
        // Global sentiment effect (-20% to +20% based on sentiment)
        const sentimentEffect = marketSentiment.globalSentiment * 0.2;
        totalMultiplier += sentimentEffect;
        
        // Collection-specific sentiment
        const collectionSentiment = marketSentiment.collectionSentiment[nft.collectionName] || 0;
        const collectionEffect = collectionSentiment * 0.15;
        totalMultiplier += collectionEffect;
        
        // NPC activity effect (more NPCs = more volatility)
        const npcEffect = (marketSentiment.npcActivityLevel - 0.5) * 0.1;
        totalMultiplier += npcEffect;
        
        // Rarity-based volatility (rarer items are more volatile)
        const rarityVolatility = getRarityVolatility(nft.colorRarity, nft.propRarity);
        totalMultiplier += (Math.random() - 0.5) * rarityVolatility;
        
        // Collection status effects
        const statusEffect = getCollectionStatusEffect(nft.status);
        totalMultiplier += statusEffect;
        
        // Active event effects
        const eventEffect = getEventEffect(marketSentiment.activeEvents, nft);
        totalMultiplier += eventEffect;
      } else {
        // Fallback to original simple random walk if no sentiment provided
        totalMultiplier = 1 + ((Math.random() * 0.2) - 0.1);
      }
      
      newPrice = Math.max(1, Math.round(oldPrice * totalMultiplier));
      
      // Satirical chaos: occasional wild swings (reduced frequency for realism)
      if (Math.random() < 0.005) { // 0.5% chance instead of 1%
        const swing = (Math.random() * 1.5) + 0.5; // 0.5x to 2x
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
        marketStatus: nft.marketStatus,
        priceChange: ((newPrice - oldPrice) / oldPrice * 100).toFixed(1) + '%'
      });
    }
    return updatedNfts;
  } catch (error) {
    console.error('Error updating NFT prices:', error);
    return [];
  }
};

/**
 * Calculates rarity-based volatility multiplier
 */
function getRarityVolatility(colorRarity: string, propRarity: string): number {
  const rarityVolatilityMap: { [key: string]: number } = {
    'common': 0.05,
    'uncommon': 0.08,
    'rare': 0.12,
    'veryrare': 0.15,
    'notpresent': 0.03
  };
  
  const colorVolatility = rarityVolatilityMap[colorRarity] || 0.05;
  const propVolatility = rarityVolatilityMap[propRarity] || 0.05;
  
  return (colorVolatility + propVolatility) / 2;
}

/**
 * Calculates collection status effect on price
 */
function getCollectionStatusEffect(status: string): number {
  const statusEffects: { [key: string]: number } = {
    'new': 0.05,      // Slight premium for new collections
    'normal': 0.00,   // No effect
    'declining': -0.08, // Discount for declining collections
    'dead': -0.15     // Heavy discount for dead collections
  };
  
  return statusEffects[status] || 0.00;
}

/**
 * Calculates event effects on NFT price
 */
function getEventEffect(activeEvents: string[], nft: any): number {
  let totalEffect = 0;
  
  for (const event of activeEvents) {
    switch (event) {
      case 'cryptoMarketCrash':
        totalEffect -= 0.2; // -20% during crash
        break;
      case 'celebrityEndorsement':
        if (nft.collectionName.includes('famous') || nft.collectionName.includes('celebrity')) {
          totalEffect += 0.3; // +30% for celebrity-related NFTs
        }
        break;
      case 'environmentalBacklash':
        if (nft.blockchain === 'ETH') {
          totalEffect -= 0.15; // -15% for energy-intensive blockchains
        }
        break;
      case 'techBoom':
        if (nft.blockchain === 'SOL' || nft.blockchain === 'AVAX') {
          totalEffect += 0.2; // +20% for tech-forward blockchains
        }
        break;
    }
  }
  
  return totalEffect;
}

/**
 * Updates prices for all listed NFTs using the original simple method.
 * Kept for backward compatibility.
 */
export const updateAllListedNftPricesSimple = async () => {
  return updateAllListedNftPrices(); // Uses default behavior when no sentiment provided
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
  const query: any = { marketStatus: MarketStatus.Listed };
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