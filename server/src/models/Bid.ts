import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IBid extends Document {
  id: string; // UUID
  auctionId: Types.ObjectId;
  bidderId: Types.ObjectId;
  bidAmount: number;
  quantity?: number; // For batch auctions (how many NFTs they want)
  
  // Bid type tracking
  isAutobid: boolean;
  maxAutobidAmount?: number; // Only for autobids - maximum they're willing to pay
  autobidIncrement?: number; // Only for autobids - how much to increment each time
  
  // Timing
  bidTime: Date;
  
  // Status
  isWinning: boolean; // Whether this bid is currently winning
  isOutbid: boolean; // Whether this bid has been outbid
  
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>({
  id: { type: String, default: uuidv4, unique: true },
  auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
  bidderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  quantity: { type: Number, default: 1 }, // Default to 1 for non-batch auctions
  
  // Bid type tracking
  isAutobid: { type: Boolean, default: false },
  maxAutobidAmount: { type: Number }, // Only set for autobids
  autobidIncrement: { type: Number, default: 1 }, // Default increment
  
  // Timing
  bidTime: { type: Date, required: true, default: Date.now },
  
  // Status
  isWinning: { type: Boolean, default: true }, // New bids start as winning until outbid
  isOutbid: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes for efficient queries
BidSchema.index({ auctionId: 1, bidTime: -1 }); // Find bids for auction, newest first
BidSchema.index({ bidderId: 1 }); // Find all bids by user
BidSchema.index({ auctionId: 1, isWinning: 1 }); // Find winning bids for auction
BidSchema.index({ bidTime: -1 }); // Find recent bids across all auctions

// Pre-save middleware to update timestamps
BidSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const BidModel = model<IBid>('Bid', BidSchema);

export default BidModel;