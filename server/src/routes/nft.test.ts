import request from 'supertest';
import express from 'express';
import nftRoutes from './nft';
import * as nftGenerationService from '../services/nftGenerationService';
import { body, validationResult } from 'express-validator';

// Mock the service
jest.mock('../services/nftGenerationService');
// Mock express-validator's validationResult function
jest.mock('express-validator', () => ({
  ...jest.requireActual('express-validator'),
  validationResult: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/nft', nftRoutes);

describe('NFT Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/nft/generate', () => {
    it('should call generateNft and return 201 on success', async () => {
      const mockGeneratedNft = { _id: 'some-nft-id', name: 'Generated NFT' };
      (nftGenerationService.generateNft as jest.Mock).mockResolvedValue(mockGeneratedNft);
      (validationResult as unknown as jest.Mock).mockReturnValue({ isEmpty: () => true });

      const response = await request(app)
        .post('/api/nft/generate')
        .send({ collectionName: 'Test Collection' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockGeneratedNft);
      expect(nftGenerationService.generateNft).toHaveBeenCalledWith('Test Collection');
    });

    it('should return 400 if validation fails', async () => {
        (validationResult as unknown as jest.Mock).mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'Invalid collectionName' }],
          });

      const response = await request(app)
        .post('/api/nft/generate')
        .send({ collectionName: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ errors: [{ msg: 'Invalid collectionName' }] });
      expect(nftGenerationService.generateNft).not.toHaveBeenCalled();
    });

    it('should return 404 if the NFT set is not found', async () => {
        (validationResult as unknown as jest.Mock).mockReturnValue({ isEmpty: () => true });
        const errorMessage = 'NFT Set with collection name "Test Collection" not found.';
        (nftGenerationService.generateNft as jest.Mock).mockRejectedValue(new Error(errorMessage));
  
        const response = await request(app)
          .post('/api/nft/generate')
          .send({ collectionName: 'Test Collection' });
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: errorMessage });
      });

    it('should return 500 on other errors', async () => {
      (validationResult as unknown as jest.Mock).mockReturnValue({ isEmpty: () => true });
      const errorMessage = 'Internal Server Error';
      (nftGenerationService.generateNft as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/api/nft/generate')
        .send({ collectionName: 'Test Collection' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Internal Server Error' });
    });
  });
}); 