import request from 'supertest';
import express from 'express';
import nftRoutes from './nft';
import * as nftGenerationService from '../services/nftGenerationService';

jest.mock('../services/nftGenerationService');

const app = express();
app.use(express.json());
app.use('/api/nft', nftRoutes);

describe('NFT Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/nft/generate', () => {
    it('should generate a new NFT and return 201', async () => {
      const mockNft = { _id: 'nftid123', displayName: 'Crypto Toaster #1', collectionName: 'Crypto Toasters' };
      (nftGenerationService.generateNft as jest.Mock).mockResolvedValue(mockNft);
      const response = await request(app)
        .post('/api/nft/generate')
        .send({ collectionName: 'Crypto Toasters' });
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockNft);
      expect(nftGenerationService.generateNft).toHaveBeenCalledWith('Crypto Toasters');
    });

    it('should return 400 if collectionName is missing', async () => {
      const response = await request(app)
        .post('/api/nft/generate')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if collectionName is not a string', async () => {
      const response = await request(app)
        .post('/api/nft/generate')
        .send({ collectionName: 123 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 if the collection does not exist', async () => {
      (nftGenerationService.generateNft as jest.Mock).mockRejectedValue(new Error('NFT Set collection not found.'));
      const response = await request(app)
        .post('/api/nft/generate')
        .send({ collectionName: 'Nonexistent Collection' });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'NFT Set collection not found.' });
    });

    it('should return 500 on server error', async () => {
      (nftGenerationService.generateNft as jest.Mock).mockRejectedValue(new Error('Unexpected error'));
      const response = await request(app)
        .post('/api/nft/generate')
        .send({ collectionName: 'Crypto Toasters' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Internal Server Error');
    });
  });
}); 