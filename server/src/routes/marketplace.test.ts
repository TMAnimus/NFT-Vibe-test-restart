import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app'; // Import the app
import * as marketplaceService from '../services/marketplaceService';
import { HttpError } from '../services/marketplaceService';
import { Rarity } from '../models/enums';

// Mock the entire marketplaceService
jest.mock('../services/marketplaceService');

// Extend NodeJS.Global to allow our test flag
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      __TEST_NOT_OWNER__?: boolean;
    }
  }
}

interface MockNft {
    _id: string;
    colorRarity: Rarity;
    propRarity: Rarity;
    blockchain: string;
    isFirstOfSet: boolean;
    ownerId: string;
    save: jest.Mock;
}

// Mock the NFT model before importing the app/routes
const validObjectId = '507f1f77bcf86cd799439011';
const mockNft: MockNft = {
  _id: validObjectId,
  colorRarity: Rarity.Rare,
  propRarity: Rarity.VeryRare,
  blockchain: 'Ethereum',
  isFirstOfSet: true,
  ownerId: 'mockUserId', // for success case
  save: jest.fn().mockResolvedValue(true),
};
const notOwnerNft: MockNft = {
  ...mockNft,
  ownerId: 'notTheUser',
};
jest.mock('../models/NFT', () => ({
  __esModule: true,
  default: {
    findById: (id: any) => {
      // Helper to wrap the NFT object with .lean() and .populate() support
      const wrap = (nft: any) => ({
        ...nft,
        save: nft.save,
        lean: () => {
            const { ownerId, save, ...rest } = nft;
            return Promise.resolve(rest);
        },
        populate: function () { return this; },
      });
      if ((global as any).__TEST_NOT_OWNER__) {
        return wrap(notOwnerNft);
      }
      if (id === validObjectId) {
        return wrap(mockNft);
      }
      // Return an object with .lean()/.populate() that resolves to null for not found
      return {
        lean: () => Promise.resolve(null),
        populate: function () { return this; },
      };
    },
  },
}));

// Mock the named export 'authMiddleware' for all requests in these tests
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    if (!req.user) req.user = {};
    req.user.userId = 'mockUserId';
    req.user.username = 'mockUser';
    next();
  }
}));
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Marketplace Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/marketplace/listed', () => {
    it('should return a list of NFTs and a 200 status code', async () => {
      const mockNfts = [
        { _id: '1', name: 'Test NFT 1', price: 100 },
        { _id: '2', name: 'Test NFT 2', price: 200 },
      ];
      // Mock the service function to return our mock data
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);

      const response = await request(app).get('/api/marketplace/listed');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on a server error', async () => {
        (marketplaceService.getListedNfts as jest.Mock).mockRejectedValue({ message: 'Database error', status: 500 });
  
        const response = await request(app).get('/api/marketplace/listed');
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Database error', error: 'Database error' });
    });
  });

  describe('GET /api/marketplace/listed with filters', () => {
    it('should filter by colorRarity', async () => {
      const mockNfts = [{ _id: '1', colorRarity: Rarity.Rare }];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?colorRarity=rare');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: Rarity.Rare,
        propRarity: undefined,
        blockchain: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      });
    });
    it('should filter by propRarity', async () => {
      const mockNfts = [{ _id: '2', propRarity: Rarity.VeryRare }];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?propRarity=veryRare');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: undefined,
        propRarity: Rarity.VeryRare,
        blockchain: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      });
    });
    it('should filter by blockchain', async () => {
      const mockNfts = [{ _id: '3', blockchain: 'Ethereum' }];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?blockchain=Ethereum');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: undefined,
        propRarity: undefined,
        blockchain: 'Ethereum',
        minPrice: undefined,
        maxPrice: undefined,
      });
    });
    it('should filter by minPrice and maxPrice', async () => {
      const mockNfts = [{ _id: '4', currentPrice: 150 }];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?minPrice=100&maxPrice=200');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: undefined,
        propRarity: undefined,
        blockchain: undefined,
        minPrice: 100,
        maxPrice: 200,
      });
    });
    it('should filter by a combination of filters', async () => {
      const mockNfts = [{ _id: '5', colorRarity: Rarity.Rare, propRarity: Rarity.Common, blockchain: 'Polygon', currentPrice: 120 }];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?colorRarity=rare&propRarity=common&blockchain=Polygon&minPrice=100&maxPrice=150');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: Rarity.Rare,
        propRarity: Rarity.Common,
        blockchain: 'Polygon',
        minPrice: 100,
        maxPrice: 150,
      });
    });
    it('should return an empty array if no NFTs match the filters', async () => {
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue([]);
      const response = await request(app).get('/api/marketplace/listed?colorRarity=nonexistent');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
    it('should return all listed NFTs if no filters are provided', async () => {
      const mockNfts = [
        { _id: '1', colorRarity: Rarity.Rare },
        { _id: '2', colorRarity: Rarity.Common },
      ];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: undefined,
        propRarity: undefined,
        blockchain: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      });
    });
    it('should handle invalid price values gracefully', async () => {
      const mockNfts = [
        { _id: '1', currentPrice: 100 },
      ];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?minPrice=notanumber');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      // minPrice will be NaN, which is treated as undefined in the route
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: undefined,
        propRarity: undefined,
        blockchain: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      });
    });
  });

  describe('POST /api/marketplace/list', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it('should list an NFT and return 200', async () => {
      // Use a valid MongoDB ObjectId string
      const listPayload = { nftId: validObjectId, price: 150 };
      (marketplaceService.listNft as jest.Mock).mockResolvedValue({ message: 'NFT listed successfully' });

      const response = await request(app)
        .post('/api/marketplace/list')
        .set('Content-Type', 'application/json')
        .send(listPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'NFT listed successfully' });
      expect(marketplaceService.listNft).toHaveBeenCalledWith(listPayload.nftId, 'mockUserId', listPayload.price);
    });

    it('should return 400 for invalid input', async () => {
      // Use a valid ObjectId but invalid price
      const validNftId = new mongoose.Types.ObjectId().toHexString();
      const response = await request(app)
        .post('/api/marketplace/list')
        .set('Content-Type', 'application/json')
        .send({ nftId: validNftId, price: -10 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 if the NFT is not found', async () => {
      const notFoundId = '507f1f77bcf86cd799439012';
      const listPayload = { nftId: notFoundId, price: 150 };
      (marketplaceService.listNft as jest.Mock).mockImplementation(() => {
        throw { message: 'NFT not found.', status: 404 };
      });

      const response = await request(app)
        .post('/api/marketplace/list')
        .set('Content-Type', 'application/json')
        .send(listPayload);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'NFT not found.', error: 'NFT not found.' });
    });

    it('should return 401 if the user is not the owner', async () => {
      // Set a global flag so the mock returns an NFT with a different ownerId
      (global as any).__TEST_NOT_OWNER__ = true;
      const listPayload = { nftId: validObjectId, price: 150 };
      (marketplaceService.listNft as jest.Mock).mockImplementation(() => {
        throw { message: 'User is not the owner of this NFT.', status: 401 };
      });

      const response = await request(app)
        .post('/api/marketplace/list')
        .set('Content-Type', 'application/json')
        .send(listPayload);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'User is not the owner of this NFT.', error: 'User is not the owner of this NFT.' });
      // Clean up the flag
      delete (global as any).__TEST_NOT_OWNER__;
    });
  });

  describe('POST /api/marketplace/buy/:nftId', () => {
    it('should buy an NFT and return 200', async () => {
      const validNftId = validObjectId;
      (marketplaceService.buyNft as jest.Mock).mockResolvedValue({ message: 'NFT purchased successfully' });

      const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'NFT purchased successfully' });
      expect(marketplaceService.buyNft).toHaveBeenCalledWith(validNftId, 'mockUserId');
    });

    it('should return 400 if NFT is not for sale', async () => {
        const validNftId = validObjectId;
        (marketplaceService.buyNft as jest.Mock).mockRejectedValue({ message: 'This NFT is not for sale.', status: 400 });
  
        const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'This NFT is not for sale.', error: 'This NFT is not for sale.' });
    });

    it('should return 400 for insufficient funds', async () => {
        const validNftId = validObjectId;
        (marketplaceService.buyNft as jest.Mock).mockRejectedValue({ message: 'Insufficient funds.', status: 400 });
  
        const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Insufficient funds.', error: 'Insufficient funds.' });
    });

    it('should return 400 if user tries to buy their own NFT', async () => {
        const validNftId = validObjectId;
        (marketplaceService.buyNft as jest.Mock).mockRejectedValue({ message: 'Cannot buy your own NFT.', status: 400 });
  
        const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Cannot buy your own NFT.', error: 'Cannot buy your own NFT.' });
    });

    it('should return 404 if NFT is not found', async () => {
        const validNftId = validObjectId;
        (marketplaceService.buyNft as jest.Mock).mockRejectedValue({ message: 'NFT not found.', status: 404 });
  
        const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'NFT not found.', error: 'NFT not found.' });
    });
  });

  describe('GET /api/marketplace/suggest-price/:nftId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const validObjectId = '507f1f77bcf86cd799439011';
    const mockSuggestNft = {
  _id: validObjectId,
  colorRarity: Rarity.Rare,
  propRarity: Rarity.VeryRare,
  blockchain: 'Ethereum',
  isFirstOfSet: true
};
    it('should return the suggested price for a valid NFT', async () => {
      (marketplaceService.suggestPriceForNft as jest.Mock).mockResolvedValue(250);
      const response = await request(app).get(`/api/marketplace/suggest-price/${validObjectId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ suggestedPrice: 250 });
      expect(marketplaceService.suggestPriceForNft).toHaveBeenCalledWith(mockSuggestNft, []);
    });
    it('should return 404 if NFT is not found', async () => {
      (marketplaceService.suggestPriceForNft as jest.Mock).mockRejectedValue(new HttpError('NFT not found', 404));
      const response = await request(app).get('/api/marketplace/suggest-price/nonexistentId507f1f77bcf86cd799439012');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'NFT not found', error: 'NFT not found' });
    });
    it('should return 500 if the service throws an error', async () => {
      (marketplaceService.suggestPriceForNft as jest.Mock).mockRejectedValue(new Error('Calculation error'));
      const response = await request(app).get(`/api/marketplace/suggest-price/${validObjectId}`);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Calculation error');
      expect(response.body).toHaveProperty('error', 'Calculation error');
    });
  });
});

describe('POST /api/marketplace/batch-buy', () => {
  it('should buy from a batch NFT and return 200', async () => {
    (marketplaceService.buyFromBatch as jest.Mock).mockResolvedValue({ message: 'Successfully purchased 2 from batch NFT Potato' });
    const response = await request(app)
      .post('/api/marketplace/batch-buy')
      .send({ nftId: validObjectId, quantity: 2 });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Successfully purchased 2 from batch NFT Potato' });
    expect(marketplaceService.buyFromBatch).toHaveBeenCalledWith({ nftId: validObjectId, buyerId: 'mockUserId', quantity: 2 });
  });
  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/api/marketplace/batch-buy')
      .send({ nftId: '', quantity: 0 });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
  it('should return 404 if batch NFT not found', async () => {
    (marketplaceService.buyFromBatch as jest.Mock).mockRejectedValue({ message: 'Batch NFT not found.', status: 404 });
    const response = await request(app)
      .post('/api/marketplace/batch-buy')
      .send({ nftId: validObjectId, quantity: 2 });
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
  });
  it('should return 400 for service errors', async () => {
    (marketplaceService.buyFromBatch as jest.Mock).mockRejectedValue({ message: 'Insufficient funds.', status: 400 });
    const response = await request(app)
      .post('/api/marketplace/batch-buy')
      .send({ nftId: validObjectId, quantity: 2 });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/insufficient funds/i);
  });
});

describe('POST /api/marketplace/batch-sell', () => {
  it('should sell to a batch NFT and return 200', async () => {
    (marketplaceService.sellToBatch as jest.Mock).mockResolvedValue({ message: 'Successfully sold 2 to batch NFT Potato' });
    const response = await request(app)
      .post('/api/marketplace/batch-sell')
      .send({ nftId: validObjectId, quantity: 2 });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Successfully sold 2 to batch NFT Potato' });
    expect(marketplaceService.sellToBatch).toHaveBeenCalledWith({ nftId: validObjectId, sellerId: 'mockUserId', quantity: 2 });
  });
  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/api/marketplace/batch-sell')
      .send({ nftId: '', quantity: 0 });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });
  it('should return 404 if batch NFT not found', async () => {
    (marketplaceService.sellToBatch as jest.Mock).mockRejectedValue({ message: 'Batch NFT not found.', status: 404 });
    const response = await request(app)
      .post('/api/marketplace/batch-sell')
      .send({ nftId: validObjectId, quantity: 2 });
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
  });
  it('should return 400 for service errors', async () => {
    (marketplaceService.sellToBatch as jest.Mock).mockRejectedValue({ message: 'Seller not found.', status: 400 });
    const response = await request(app)
      .post('/api/marketplace/batch-sell')
      .send({ nftId: validObjectId, quantity: 2 });
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/seller not found/i);
  });
});