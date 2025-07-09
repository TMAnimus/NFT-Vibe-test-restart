import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Rarity, CollectionStatus } from './enums';

export enum StrategyType {
  Conservative = 'conservative',
  Aggressive = 'aggressive',
  Speculative = 'speculative',
  Collector = 'collector',
  Opportunist = 'opportunist',
}

export enum CollectorFocusType {
  Color = 'color',
  Prop = 'prop',
  ColorAndProp = 'colorAndProp',
}

export interface CollectorFocus {
  type: CollectorFocusType;
  color?: string;
  prop?: string;
}

export interface NPC extends Document {
  id: string; // UUID
  name: string;
  strategy: {
    type: StrategyType;
    riskTolerance: number;
    collectionPreferences?: string[];
    collectorFocus?: CollectorFocus;
  };
  wallet: {
    balance: number;
    totalSpent: number;
    totalEarned: number;
    lastRefresh: Date;
  };
  portfolio: {
    nfts: Types.ObjectId[];
    collections: Types.ObjectId[];
    firstOfSets: Types.ObjectId[];
  };
  behavior: {
    lastAction: Date;
    actionFrequency: number;
    preferredPriceRange: {
      min: number;
      max: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const CollectorFocusSchema = new Schema<CollectorFocus>({
  type: { type: String, enum: Object.values(CollectorFocusType), required: true },
  color: { type: String },
  prop: { type: String },
}, { _id: false });

const NPCSchema = new Schema<NPC>({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  strategy: {
    type: {
      type: String,
      enum: Object.values(StrategyType),
      required: true,
    },
    riskTolerance: { type: Number, required: true },
    collectionPreferences: [{ type: String }],
    collectorFocus: { type: CollectorFocusSchema },
  },
  wallet: {
    balance: { type: Number, required: true, default: 10000 },
    totalSpent: { type: Number, required: true, default: 0 },
    totalEarned: { type: Number, required: true, default: 0 },
    lastRefresh: { type: Date, required: true, default: Date.now },
  },
  portfolio: {
    nfts: [{ type: Schema.Types.ObjectId, ref: 'NFT', default: [] }],
    collections: [{ type: Schema.Types.ObjectId, ref: 'NFTSet', default: [] }],
    firstOfSets: [{ type: Schema.Types.ObjectId, ref: 'NFT', default: [] }],
  },
  behavior: {
    lastAction: { type: Date, required: true, default: Date.now },
    actionFrequency: { type: Number, required: true, default: 1 },
    preferredPriceRange: {
      min: { type: Number, required: true, default: 0 },
      max: { type: Number, required: true, default: 10000 },
    },
  },
}, { timestamps: true });

export const NPCModel = model<NPC>('NPC', NPCSchema); 