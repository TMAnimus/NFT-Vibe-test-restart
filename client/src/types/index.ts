// Shared types mirroring server-side enums

export type MarketStatus = 'Owned' | 'Listed' | 'Auction' | 'Sold';

export type AuctionType = 'standard' | 'dutch' | 'reserve';

export type AuctionStatus = 'active' | 'ended' | 'cancelled';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'veryRare' | 'notPresent';

export interface Prop {
  name: string;
  rarity: Rarity;
}

export interface NFT {
  _id: string;
  collectionName: string;
  displayName: string;
  color: string;
  thing: string;
  colorRarity: Rarity;
  propRarity: Rarity;
  props: Prop[];
  currentPrice: number;
  marketStatus: MarketStatus;
  isFirstOfSet?: boolean;
  ownerId?: {
    _id: string;
    username: string;
  };
}

export interface Auction {
  _id: string;
  id: string;
  nftId: {
    _id: string;
    collectionName: string;
    displayName: string;
    color: string;
    thing: string;
    colorRarity: Rarity;
    propRarity: Rarity;
    props: Prop[];
    currentPrice: number;
    isFirstOfSet?: boolean;
    marketStatus?: MarketStatus;
  };
  sellerId: {
    _id: string;
    username: string;
  };
  auctionType: AuctionType;
  auctionStatus: AuctionStatus;
  startingBid: number;
  currentBid?: number;
  reservePrice?: number;
  dutchCurrentPrice?: number;
  endTime: string;
  winnerId?: {
    _id: string;
    username: string;
  };
}
