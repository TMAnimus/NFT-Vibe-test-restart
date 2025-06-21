import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  pin: string; // This will store the hashed PIN
  balance: number;
  nfts: ObjectId[]; // Array of NFT ObjectIds held by the user
} 