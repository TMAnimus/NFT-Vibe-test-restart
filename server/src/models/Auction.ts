import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AuctionType, AuctionStatus } from './enums';

export interface IAutobid {
  userId: Types.ObjectId;
  maxBid: number;
  increment: number;
}

export interface IAuction extends Document {
  id: string; // UUID
  nftId: Types.ObjectId;
  sellerId: Types.ObjectId;
  auctionType: AuctionType;
  auctionStatus: AuctionStatus;
  
  // Pricing
  startingBid: number;
  currentBid?: number;
  reservePrice?: number; // For reserve auctions only
  
  // Dutch auction specifics
  dutchStartPrice?: number;
  dutchCurrentPrice?: number;
  dutchPriceDecrement?: number;
  dutchDecrementInterval?: number; // seconds
  
  // Timing
  startTime: Date;
  endTime: Date;
  duration: number; // seconds
  
  // Batch auction specifics
  batchCount?: number;
  batchPrice?: number;
  
  // Winner info
  winnerId?: Types.ObjectId;
  winningBid?: number;
  winningTime?: Date;
  
  // Autobid settings
  autobids: IAutobid[];
  
  createdAt: Date;
  updatedAt: Date;
}

const AutobidSchema = new Schema<IAutobid>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  maxBid: { type: Number, required: true },
  increment: { type: Number, required: true },
}, { _id: false });

const AuctionSchema = new Schema<IAuction>({
  id: { type: String, default: uuidv4, unique: true },
  nftId: { type: Schema.Types.ObjectId, ref: 'NFT', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  auctionType: { type: String, enum: Object.values(AuctionType), required: true },
  auctionStatus: { type: String, enum: Object.values(AuctionStatus), required: true, default: AuctionStatus.Active },
  
  // Pricing
  startingBid: { type: Number, required: true },
  currentBid: { type: Number },
  reservePrice: { type: Number }, // Only used for reserve auctions
  
  // Dutch auction specifics
  dutchStartPrice: { type: Number },
  dutchCurrentPrice: { type: Number },
  dutchPriceDecrement: { type: Number },
  dutchDecrementInterval: { type: Number },
  
  // Timing
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  
  // Batch auction specifics
  batchCount: { type: Number },
  batchPrice: { type: Number },
  
  // Winner info
  winnerId: { type: Schema.Types.ObjectId, ref: 'User' },
  winningBid: { type: Number },
  winningTime: { type: Date },
  
  // Autobid settings
  autobids: { type: [AutobidSchema], default: [] },
}, { timestamps: true });

// Indexes for efficient queries
AuctionSchema.index({ auctionStatus: 1, endTime: 1 }); // Find active auctions ending soon
AuctionSchema.index({ nftId: 1 }); // Find auctions for specific NFT
AuctionSchema.index({ sellerId: 1 }); // Find auctions by seller
AuctionSchema.index({ winnerId: 1 }); // Find auctions won by user

const AuctionModel = model<IAuction>('Auction', AuctionSchema);

export default AuctionModel;