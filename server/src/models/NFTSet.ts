import { Schema, model, Document } from 'mongoose';
import { Rarity, CollectionStatus } from './enums';

interface IAttribute {
    name: string;
    rarity: Rarity;
    weight: number;
}

interface IProp extends IAttribute {
    verb: string | null;
}

export interface INFTSet extends Document {
    thing: string;
    collectionName: string;
    blockchain: string;
    colors: IAttribute[];
    props: IProp[];
    backgrounds?: IAttribute[];
    expressions?: IAttribute[];
    collectionStatus: CollectionStatus;
    basePrice: number;
}

const attributeSchema = new Schema<IAttribute>({
    name: { type: String, required: true },
    rarity: { type: String, enum: Object.values(Rarity), required: true },
    weight: { type: Number, required: true }
}, { _id: false });

const propSchema = new Schema<IProp>({
    name: { type: String, required: true },
    rarity: { type: String, enum: Object.values(Rarity), required: true },
    weight: { type: Number, required: true },
    verb: { type: String, default: null }
}, { _id: false });

const NFTSetSchema = new Schema<INFTSet>({
    thing: { type: String, required: true },
    collectionName: { type: String, required: true, unique: true, sparse: true },
    blockchain: { type: String, enum: ['ETH', 'SOL', 'BTC'], required: true },
    colors: [attributeSchema],
    props: [propSchema],
    backgrounds: [attributeSchema],
    expressions: [attributeSchema],
    collectionStatus: { type: String, enum: Object.values(CollectionStatus), default: CollectionStatus.New },
    basePrice: { type: Number, default: 100 }
});

const NFTSetModel = model<INFTSet>('NFTSet', NFTSetSchema);

export default NFTSetModel; 