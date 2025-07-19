import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: 'K:/Projects/NFT_test_3/server/.env' });
import request from 'supertest';
import express from 'express';
import userRoutes from './user';
import { authMiddleware } from '../middleware/auth';
import mongoose from 'mongoose';
import authRoutes from './auth';
import { UserModel } from '../models/User';
import NFTModel from '../models/NFT';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);

let jwtToken: string = '';
let testUsername = `testuser_${Date.now()}`;
const testPin = '1234';

// Increase timeout for this test suite
jest.setTimeout(30000);

beforeAll(async () => {
  try {
    // Connect to the test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/nft_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      } as any);
    }
    
    // Register test user
    await request(app)
      .post('/api/auth/register')
      .send({ username: testUsername, pin: testPin });
    
    // Login to get JWT
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: testUsername, pin: testPin });
    jwtToken = loginRes.body.token;
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Clean up test user
    if (mongoose.connection.db) {
      await mongoose.connection.db.collection('users').deleteMany({ username: testUsername });
    }
    await mongoose.disconnect();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
});

describe('User Routes', () => {
  describe('GET /api/user/profile', () => {
    it('should return the user profile for a valid user', async () => {
      // Mock NFTModel.find to return empty array (user has no NFTs)
      const findSpy = jest.spyOn(NFTModel, 'find').mockResolvedValueOnce([]);
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', testUsername);
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('nfts');
      expect(Array.isArray(response.body.nfts)).toBe(true);
      
      findSpy.mockRestore();
    });

    it('should return user profile with NFT objects when user has NFTs', async () => {
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
      const findSpy = jest.spyOn(NFTModel, 'find').mockResolvedValueOnce(mockNfts);
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.nfts).toEqual(mockNfts);
      expect(response.body.nfts[0]).toHaveProperty('colorRarity');
      expect(response.body.nfts[0]).toHaveProperty('propRarity');
      expect(response.body.nfts[0]).toHaveProperty('blockchain');
      expect(response.body.nfts[0]).toHaveProperty('isFirstOfSet');
      
      findSpy.mockRestore();
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
      const findByIdSpy = jest.spyOn(UserModel, 'findById').mockResolvedValueOnce(null);
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
      findByIdSpy.mockRestore();
    });

    it('should return 500 on server error', async () => {
      const findByIdSpy = jest.spyOn(UserModel, 'findById').mockImplementationOnce(() => { throw new Error('DB error'); });
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Server error');
      findByIdSpy.mockRestore();
    });
  });
}); 