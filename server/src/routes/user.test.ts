import dotenv from 'dotenv';
dotenv.config();

// Mock the models before importing the route
jest.mock('../models/User', () => ({
  UserModel: {
    findById: jest.fn()
  }
}));

jest.mock('../models/NFT', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockReturnValue({
      lean: jest.fn()
    })
  }
}));

import request from 'supertest';
import express from 'express';
import userRoutes from './user';
import { authMiddleware } from '../middleware/auth';
import mongoose from 'mongoose';
import authRoutes from './auth';
import { UserModel } from '../models/User';
import NFTModel from '../models/NFT';
import { connectTestDB, clearTestDB, closeTestDB } from '../test/db';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);

let jwtToken: string = '';
let testUsername = `testuser_${Date.now()}`;
const testPin = '1234';
const testUserId = '507f1f77bcf86cd799439011'; // Mock user ID

// Increase timeout for this test suite
jest.setTimeout(30000);

beforeAll(async () => {
  try {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Connect to test database and clear it
    await connectTestDB();
    await clearTestDB();
    
    // Create a mock JWT token for testing
    const jwt = require('jsonwebtoken');
    jwtToken = jwt.sign(
      { userId: testUserId, username: testUsername },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await closeTestDB();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
});

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/user/profile', () => {
    it('should return the user profile for a valid user', async () => {
      // Mock UserModel.findById to return a user
      const mockUser = {
        _id: testUserId,
        username: testUsername,
        balance: 1000,
        pin: 'hashedPin'
      };
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser);
      
      // Mock NFTModel.find to return empty array (user has no NFTs)
      (NFTModel.find as jest.Mock).mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce([])
      });
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', testUsername);
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('nfts');
      expect(Array.isArray(response.body.nfts)).toBe(true);
    });

    it('should return user profile with NFT objects when user has NFTs', async () => {
      // Mock UserModel.findById to return a user
      const mockUser = {
        _id: testUserId,
        username: testUsername,
        balance: 1000,
        pin: 'hashedPin'
      };
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(mockUser);
      
      // Mock NFTModel.find to return some NFT objects
      const mockNfts = [
        {
          _id: 'nft1',
          color: 'red',
          thing: 'toaster',
          colorRarity: 'rare',
          propRarity: 'common',
          blockchain: '',
          currentPrice: 100,
          isFirstOfSet: true
        }
      ];
      (NFTModel.find as jest.Mock).mockReturnValueOnce({
        lean: jest.fn().mockResolvedValueOnce(mockNfts)
      });
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.nfts).toEqual(mockNfts);
      expect(response.body.nfts[0]).toHaveProperty('colorRarity');
      expect(response.body.nfts[0]).toHaveProperty('propRarity');
      expect(response.body.nfts[0]).toHaveProperty('blockchain');
      expect(response.body.nfts[0]).toHaveProperty('isFirstOfSet');
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mount the route without authMiddleware
      const express = require('express');
      const userRoutes = require('./user').default;
      const appNoAuth = express();
      appNoAuth.use(express.json());
      appNoAuth.use('/api/user', userRoutes);
      const response = await request(appNoAuth).get('/api/user/profile');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });

    it('should return 404 if user is not found', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValueOnce(null);
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 500 on server error', async () => {
      (UserModel.findById as jest.Mock).mockImplementationOnce(() => { throw new Error('DB error'); });
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Server error');
    });
  });
}); 