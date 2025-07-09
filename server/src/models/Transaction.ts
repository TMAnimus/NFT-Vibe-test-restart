import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ITransaction extends Document {
  id: string; // UUID
  nftId: Types.ObjectId;
  batchCount?: number;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId | 'system';
  price: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  id: { type: String, default: uuidv4, unique: true },
  nftId: { type: Schema.Types.ObjectId, ref: 'NFT', required: true },
  batchCount: { type: Number },
  buyerId: { type: Schema.Types.ObjectId, required: true },
  sellerId: { type: Schema.Types.Mixed, required: true },
  price: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

export const TransactionModel = model<ITransaction>('Transaction', TransactionSchema); 