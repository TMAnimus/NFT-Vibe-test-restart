import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
  username: string;
  pin: string; // This will store the hashed PIN
  balance: number;
  nfts: ObjectId[]; // Array of NFT ObjectIds held by the user
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  pin: { type: String, required: true },
  balance: { type: Number, default: 10000 }, // Generous starting balance
  nfts: [{ type: Schema.Types.ObjectId, ref: 'NFT' }],
}, { timestamps: true });

export const UserModel = model<IUser>('User', UserSchema); 