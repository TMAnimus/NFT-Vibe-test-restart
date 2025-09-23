import { buyFromBatch, sellToBatch } from './marketplaceService';
import NFTModel from '../models/NFT';
import { UserModel } from '../models/User';
import { TransactionModel } from '../models/Transaction';
import mongoose from 'mongoose';

jest.mock('../models/NFT');
jest.mock('../models/User');

jest.mock('../models/Transaction');

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};

describe('buyFromBatch', () => {
  beforeAll(() => {
    jest.setTimeout(30000); // Increase timeout to 30 seconds
  });

  beforeEach(() => {
    jest.resetAllMocks(); // Reset instead of clear to preserve spies
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession as any);
  });
  function mockFindByIdWithSession(modelMock: any, entity: any) {
    if (entity === null) {
      (modelMock.findById as jest.Mock).mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      return;
    }

    // Add methods to the original entity object to ensure mutations are reflected
    entity.save = jest.fn().mockImplementation(function(this: any) {
      return Promise.resolve(this);
    });
    entity.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    (modelMock.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(entity),
    });
  }
  it('should buy from a batch NFT successfully', async () => {
    const mockNft = { _id: 'nft1', batchCount: 5, batchPrice: 10, collectionName: 'test' };
    const mockBuyer = { _id: 'user1', balance: 100 };
    
    mockFindByIdWithSession(NFTModel, mockNft);
    mockFindByIdWithSession(UserModel, mockBuyer);
    (TransactionModel.create as jest.Mock).mockResolvedValue({});
    
    const result = await buyFromBatch({ nftId: 'nft1', buyerId: 'user1', quantity: 2 });
    
    // Check that the mock objects were modified by the service
    expect(mockBuyer.balance).toBe(80);
    expect(mockNft.batchCount).toBe(3);
    expect(TransactionModel.create).toHaveBeenCalledWith([
      expect.objectContaining({ nftId: 'nft1', batchCount: 2, buyerId: 'user1', sellerId: 'system', price: 20 })
    ], expect.any(Object));
    expect(result.message).toMatch(/success/i);
  });
  it('should throw if not enough in batch', async () => {
    const mockNft = { _id: 'nft1', batchCount: 1, batchPrice: 10 };
    mockFindByIdWithSession(NFTModel, mockNft);
    await expect(buyFromBatch({ nftId: 'nft1', buyerId: 'user1', quantity: 2 })).rejects.toThrow(/not enough/i);
  });
  it('should throw if insufficient funds', async () => {
    const mockNft = { _id: 'nft1', batchCount: 5, batchPrice: 10 };
    const mockBuyer = { _id: 'user1', balance: 5 };
    mockFindByIdWithSession(NFTModel, mockNft);
    mockFindByIdWithSession(UserModel, mockBuyer);
    await expect(buyFromBatch({ nftId: 'nft1', buyerId: 'user1', quantity: 2 })).rejects.toThrow(/insufficient funds/i);
  });
  it('should throw if buyer not found', async () => {
    const mockNft = { _id: 'nft1', batchCount: 5, batchPrice: 10 };
    mockFindByIdWithSession(NFTModel, mockNft);
    mockFindByIdWithSession(UserModel, null);
    await expect(buyFromBatch({ nftId: 'nft1', buyerId: 'user1', quantity: 2 })).rejects.toThrow(/buyer not found/i);
  });
  it('should throw if batch NFT not found', async () => {
    mockFindByIdWithSession(NFTModel, null);
    await expect(buyFromBatch({ nftId: 'nft1', buyerId: 'user1', quantity: 2 })).rejects.toThrow(/not found/i);
  });
  it('should throw if quantity < 1', async () => {
    await expect(buyFromBatch({ nftId: 'nft1', buyerId: 'user1', quantity: 0 })).rejects.toThrow(/at least 1/i);
  });
});

describe('sellToBatch', () => {
  beforeAll(() => {
    jest.setTimeout(30000); // Increase timeout to 30 seconds
  });

  beforeEach(() => {
    jest.resetAllMocks(); // Reset instead of clear to preserve spies
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession as any);
  });
  function mockFindByIdWithSession(modelMock: any, entity: any) {
    if (entity === null) {
      (modelMock.findById as jest.Mock).mockReturnValue({
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });
      return;
    }

    // Add methods to the original entity object to ensure mutations are reflected
    entity.save = jest.fn().mockImplementation(function(this: any) {
      return Promise.resolve(this);
    });
    entity.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

    (modelMock.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(entity),
    });
  }
  it('should sell to a batch NFT successfully', async () => {
    const mockNft = { _id: 'nft1', batchCount: 5, batchPrice: 10, collectionName: 'test' };
    const mockSeller = { _id: 'user1', balance: 100 };
    
    mockFindByIdWithSession(NFTModel, mockNft);
    mockFindByIdWithSession(UserModel, mockSeller);
    (TransactionModel.create as jest.Mock).mockResolvedValue({});
    
    const result = await sellToBatch({ nftId: 'nft1', sellerId: 'user1', quantity: 2 });
    
    // Check that the mock objects were modified by the service
    expect(mockSeller.balance).toBe(120);
    expect(mockNft.batchCount).toBe(7);
    expect(TransactionModel.create).toHaveBeenCalledWith([
      expect.objectContaining({ nftId: 'nft1', batchCount: 2, buyerId: 'system', sellerId: 'user1', price: 20 })
    ], expect.any(Object));
    expect(result.message).toMatch(/success/i);
  });
  it('should throw if seller not found', async () => {
    const mockNft = { _id: 'nft1', batchCount: 5, batchPrice: 10 };
    mockFindByIdWithSession(NFTModel, mockNft);
    mockFindByIdWithSession(UserModel, null);
    await expect(sellToBatch({ nftId: 'nft1', sellerId: 'user1', quantity: 2 })).rejects.toThrow(/seller not found/i);
  });
  it('should throw if batch NFT not found', async () => {
    mockFindByIdWithSession(NFTModel, null);
    await expect(sellToBatch({ nftId: 'nft1', sellerId: 'user1', quantity: 2 })).rejects.toThrow(/not found/i);
  });
  it('should throw if quantity < 1', async () => {
    await expect(sellToBatch({ nftId: 'nft1', sellerId: 'user1', quantity: 0 })).rejects.toThrow(/at least 1/i);
  });
});
