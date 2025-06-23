import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import marketplaceRoutes from './marketplace';
import * as marketplaceService from '../services/marketplaceService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

// Mock the entire marketplaceService
jest.mock('../services/marketplaceService');

// Mock the NFT model before importing the app/routes
const validObjectId = '507f1f77bcf86cd799439011';
const mockNft = {
  _id: validObjectId,
  colorRarity: 'rare',
  propRarity: 'veryRare',
  blockchain: 'Ethereum',
  firstOfSet: true
};
jest.mock('../models/NFT', () => ({
  __esModule: true,
  default: {
    findById: (id: any) => ({
      lean: () => id === validObjectId ? Promise.resolve(mockNft) : Promise.resolve(null)
    })
  }
}));

// Mock the auth middleware
jest.mock('../middleware/auth', () => ({
  authMiddleware: (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    // Simulate an authenticated user for all tests in this suite
    req.user = { userId: 'mockUserId', username: 'mockUser' };
    next();
  },
}));

const app = express();
app.use(express.json());
app.use('/api/marketplace', marketplaceRoutes);

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
        (marketplaceService.getListedNfts as jest.Mock).mockRejectedValue(new Error('Database error'));
  
        const response = await request(app).get('/api/marketplace/listed');
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching listed NFTs', error: 'Database error' });
    });
  });

  describe('GET /api/marketplace/listed with filters', () => {
    it('should filter by colorRarity', async () => {
      const mockNfts = [{ _id: '1', colorRarity: 'Rare' }];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?colorRarity=Rare');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: 'Rare',
        propRarity: undefined,
        blockchain: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      });
    });
    it('should filter by propRarity', async () => {
      const mockNfts = [{ _id: '2', propRarity: 'VeryRare' }];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?propRarity=VeryRare');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: undefined,
        propRarity: 'VeryRare',
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
      const mockNfts = [{ _id: '5', colorRarity: 'Rare', propRarity: 'Common', blockchain: 'Polygon', currentPrice: 120 }];
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue(mockNfts);
      const response = await request(app).get('/api/marketplace/listed?colorRarity=Rare&propRarity=Common&blockchain=Polygon&minPrice=100&maxPrice=150');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNfts);
      expect(marketplaceService.getListedNfts).toHaveBeenCalledWith({
        colorRarity: 'Rare',
        propRarity: 'Common',
        blockchain: 'Polygon',
        minPrice: 100,
        maxPrice: 150,
      });
    });
    it('should return an empty array if no NFTs match the filters', async () => {
      (marketplaceService.getListedNfts as jest.Mock).mockResolvedValue([]);
      const response = await request(app).get('/api/marketplace/listed?colorRarity=Nonexistent');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
    it('should return all listed NFTs if no filters are provided', async () => {
      const mockNfts = [
        { _id: '1', colorRarity: 'Rare' },
        { _id: '2', colorRarity: 'Common' },
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
    it('should list an NFT and return 200', async () => {
      const validNftId = new mongoose.Types.ObjectId().toHexString();
      const listPayload = { nftId: validNftId, price: 150 };
      (marketplaceService.listNft as jest.Mock).mockResolvedValue({ message: 'NFT listed successfully' });

      const response = await request(app)
        .post('/api/marketplace/list')
        .send(listPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'NFT listed successfully' });
      expect(marketplaceService.listNft).toHaveBeenCalledWith(listPayload.nftId, 'mockUserId', listPayload.price);
    });

    it('should return 400 for invalid input', async () => {
        const validNftId = new mongoose.Types.ObjectId().toHexString();
        const response = await request(app)
          .post('/api/marketplace/list')
          .send({ nftId: validNftId, price: -10 });
  
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 if the NFT is not found', async () => {
        const notFoundId = new mongoose.Types.ObjectId().toHexString();
        const listPayload = { nftId: notFoundId, price: 150 };
        (marketplaceService.listNft as jest.Mock).mockRejectedValue(new Error('NFT not found.'));
  
        const response = await request(app)
          .post('/api/marketplace/list')
          .send(listPayload);
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'NFT not found.' });
    });

    it('should return 401 if the user is not the owner', async () => {
        const notOwnedId = new mongoose.Types.ObjectId().toHexString();
        const listPayload = { nftId: notOwnedId, price: 150 };
        (marketplaceService.listNft as jest.Mock).mockRejectedValue(new Error('User is not the owner of this NFT.'));
  
        const response = await request(app)
          .post('/api/marketplace/list')
          .send(listPayload);
  
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: 'User is not the owner of this NFT.' });
    });
  });

  describe('POST /api/marketplace/buy/:nftId', () => {
    it('should buy an NFT and return 200', async () => {
      const validNftId = new mongoose.Types.ObjectId().toHexString();
      (marketplaceService.buyNft as jest.Mock).mockResolvedValue({ message: 'NFT purchased successfully' });

      const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'NFT purchased successfully' });
      expect(marketplaceService.buyNft).toHaveBeenCalledWith(validNftId, 'mockUserId');
    });

    it('should return 400 if NFT is not for sale', async () => {
        const validNftId = new mongoose.Types.ObjectId().toHexString();
        (marketplaceService.buyNft as jest.Mock).mockRejectedValue(new Error('This NFT is not for sale.'));
  
        const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'This NFT is not for sale.' });
    });

    it('should return 400 for insufficient funds', async () => {
        const validNftId = new mongoose.Types.ObjectId().toHexString();
        (marketplaceService.buyNft as jest.Mock).mockRejectedValue(new Error('Insufficient funds.'));
  
        const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Insufficient funds.' });
    });

    it('should return 400 if user tries to buy their own NFT', async () => {
        const validNftId = new mongoose.Types.ObjectId().toHexString();
        (marketplaceService.buyNft as jest.Mock).mockRejectedValue(new Error('Cannot buy your own NFT.'));
  
        const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Cannot buy your own NFT.' });
    });

    it('should return 404 if NFT is not found', async () => {
        const validNftId = new mongoose.Types.ObjectId().toHexString();
        (marketplaceService.buyNft as jest.Mock).mockRejectedValue(new Error('NFT not found.'));
  
        const response = await request(app).post(`/api/marketplace/buy/${validNftId}`);
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'NFT not found.' });
    });
  });

  describe('GET /api/marketplace/suggest-price/:nftId', () => {
    const validObjectId = '507f1f77bcf86cd799439011';
    const mockNft = {
      _id: validObjectId,
      colorRarity: 'rare',
      propRarity: 'veryRare',
      blockchain: 'Ethereum',
      firstOfSet: true
    };
    let findByIdSpy: any;
    beforeAll(() => {
      const NFTModel = require('../models/NFT').default;
      findByIdSpy = jest.spyOn(NFTModel, 'findById').mockImplementation((id: any) => ({
        lean: () => id === validObjectId ? Promise.resolve(mockNft) : Promise.resolve(null)
      }));
    });
    afterAll(() => {
      findByIdSpy.mockRestore();
    });
    it('should return the suggested price for a valid NFT', async () => {
      (marketplaceService.suggestPriceForNft as jest.Mock).mockResolvedValue(250);
      const response = await request(app).get(`/api/marketplace/suggest-price/${validObjectId}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ suggestedPrice: 250 });
      expect(marketplaceService.suggestPriceForNft).toHaveBeenCalledWith(mockNft, []);
    });
    it('should return 404 if NFT is not found', async () => {
      const response = await request(app).get('/api/marketplace/suggest-price/nonexistentId507f1f77bcf86cd799439012');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'NFT not found' });
    });
    it('should return 500 if the service throws an error', async () => {
      (marketplaceService.suggestPriceForNft as jest.Mock).mockRejectedValue(new Error('Calculation error'));
      const response = await request(app).get(`/api/marketplace/suggest-price/${validObjectId}`);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error suggesting price');
      expect(response.body).toHaveProperty('error', 'Calculation error');
    });
  });
}); 