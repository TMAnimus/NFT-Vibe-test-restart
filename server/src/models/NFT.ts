import { Schema, model, Document, ObjectId } from 'mongoose';

export type MarketStatus = 'Owned' | 'Listed' | 'Sold';

export interface INFT extends Document {
  setId: ObjectId; // Reference to the parent NFTSet
  ownerId: ObjectId | null; // Null if it's unowned/for sale by the system

  // Dynamic attributes generated for this specific instance
  attributes: {
    [key: string]: string; // e.g., { color: 'blue', prop: 'hat' }
  };
  
  isFirstOfSet: boolean;

  // Pricing
  basePrice: number;
  currentPrice: number;

  // Status
  marketStatus: MarketStatus;
  collectionName: string;
}

const NFTSchema = new Schema<INFT>({
  setId: { type: Schema.Types.ObjectId, ref: 'NFTSet', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  attributes: { type: Map, of: String, required: true },
  isFirstOfSet: { type: Boolean, default: false },
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  marketStatus: { type: String, enum: ['Owned', 'Listed', 'Sold'], default: 'Listed' },
  collectionName: { type: String, required: true },
}, { timestamps: true });

const NFTModel = model<INFT>('NFT', NFTSchema);

export default NFTModel; 