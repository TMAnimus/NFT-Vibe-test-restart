import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Rarity } from './enums';

export interface Wallet {
  balance: number;
  totalSpent: number;
  totalEarned: number;
  lastRefresh: Date;
}

export interface IPlayer extends Document {
  id: string; // UUID
  username: string;
  pinHash: string; // Hashed 4-digit PIN
  wallet: Wallet;
  ownedNFTs: Types.ObjectId[]; // Array of NFT IDs
  transactionHistory: Types.ObjectId[]; // Array of Transaction IDs
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<Wallet>({
  balance: { type: Number, required: true, default: 10000 },
  totalSpent: { type: Number, required: true, default: 0 },
  totalEarned: { type: Number, required: true, default: 0 },
  lastRefresh: { type: Date, required: true, default: Date.now },
}, { _id: false });

const PlayerSchema = new Schema<IPlayer>({
  id: { type: String, default: uuidv4, unique: true },
  username: { type: String, required: true, unique: true, trim: true },
  pinHash: { type: String, required: true },
  wallet: { type: WalletSchema, required: true, default: () => ({}) },
  ownedNFTs: [{ type: Schema.Types.ObjectId, ref: 'NFT', default: [] }],
  transactionHistory: [{ type: Schema.Types.ObjectId, ref: 'Transaction', default: [] }],
}, { timestamps: true });

export const PlayerModel = model<IPlayer>('Player', PlayerSchema); 