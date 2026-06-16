/**
 * Shared test fixtures for client component tests.
 */
import type { NFT, Auction } from './types';

export const mockNFTOwned: NFT = {
  _id: 'nft1',
  collectionName: 'Crypto Potatoes',
  displayName: 'Red Potato',
  color: 'Red',
  thing: 'Potato',
  colorRarity: 'rare',
  propRarity: 'notPresent',
  props: [],
  currentPrice: 150,
  marketStatus: 'Owned',
  isFirstOfSet: false,
};

export const mockNFTWithProps: NFT = {
  _id: 'nft2',
  collectionName: 'Crypto Toasters',
  displayName: 'Blue Toaster',
  color: 'Blue',
  thing: 'Toaster',
  colorRarity: 'uncommon',
  propRarity: 'rare',
  props: [{ name: 'sceptre', rarity: 'rare' }],
  currentPrice: 300,
  marketStatus: 'Owned',
  isFirstOfSet: true,
};

export const mockNFTListed: NFT = {
  ...mockNFTOwned,
  _id: 'nft3',
  marketStatus: 'Listed',
  ownerId: { _id: 'user1', username: 'seller1' },
};

export const mockNFTAuction: NFT = {
  ...mockNFTOwned,
  _id: 'nft4',
  marketStatus: 'Auction',
};

export const mockAuctionActive: Auction = {
  _id: 'auction1',
  id: 'auction1',
  nftId: {
    _id: 'nft1',
    collectionName: 'Crypto Potatoes',
    displayName: 'Red Potato',
    color: 'Red',
    thing: 'Potato',
    colorRarity: 'rare',
    propRarity: 'notPresent',
    props: [],
    currentPrice: 150,
    isFirstOfSet: false,
  },
  sellerId: { _id: 'seller1', username: 'seller1' },
  auctionType: 'standard',
  auctionStatus: 'active',
  startingBid: 100,
  currentBid: 120,
  endTime: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
};

export const mockAuctionDutch: Auction = {
  ...mockAuctionActive,
  _id: 'auction2',
  id: 'auction2',
  auctionType: 'dutch',
  currentBid: 200,
  dutchCurrentPrice: 180,
  startingBid: 200,
};

export const mockAuctionReserve: Auction = {
  ...mockAuctionActive,
  _id: 'auction3',
  id: 'auction3',
  auctionType: 'reserve',
  reservePrice: 200,
};

export const mockAuctionEnded: Auction = {
  ...mockAuctionActive,
  _id: 'auction4',
  id: 'auction4',
  auctionStatus: 'ended',
  endTime: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
  winnerId: { _id: 'buyer1', username: 'buyer1' },
};
