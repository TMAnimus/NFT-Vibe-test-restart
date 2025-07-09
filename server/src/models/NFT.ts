import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Rarity, CollectionStatus } from './enums';

export interface Prop {
  name: string;
  rarity: Rarity;
}

export interface INFT extends Document {
  id: string; // UUID
  setId: Types.ObjectId; // Reference to the parent NFTSet
  ownerId: Types.ObjectId | null;
  color: string;
  thing: string;
  props: Prop[];
  rarity: Rarity;
  currentPrice: number;
  batchCount?: number;
  batchPrice?: number;
  status: CollectionStatus;
  isFirstOfSet: boolean;
  basePrice: number;
  marketStatus: string;
  collectionName: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropSchema = new Schema<Prop>({
  name: { type: String, required: true },
  rarity: { type: String, enum: Object.values(Rarity), required: true },
}, { _id: false });

const NFTSchema = new Schema<INFT>({
  id: { type: String, default: uuidv4, unique: true },
  setId: { type: Schema.Types.ObjectId, ref: 'NFTSet', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'Player', default: null },
  color: { type: String, required: true },
  thing: { type: String, required: true },
  props: { type: [PropSchema], default: [] },
  rarity: { type: String, enum: Object.values(Rarity), required: true },
  currentPrice: { type: Number, required: true },
  batchCount: { type: Number },
  batchPrice: { type: Number },
  status: { type: String, enum: Object.values(CollectionStatus), required: true },
  isFirstOfSet: { type: Boolean, default: false },
  basePrice: { type: Number, required: true },
  marketStatus: { type: String, enum: ['Owned', 'Listed', 'Sold'], default: 'Listed' },
  collectionName: { type: String, required: true },
}, { timestamps: true });

const NFTModel = model<INFT>('NFT', NFTSchema);

export default NFTModel; 