import request from 'supertest';
import express from 'express';
import userRoutes from './user';
import { authMiddleware } from '../middleware/auth';
import mongoose from 'mongoose';
import authRoutes from './auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);

let jwtToken: string = '';
let testUsername = `testuser_${Date.now()}`;
const testPin = '1234';

beforeAll(async () => {
  // Connect to the test database if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/nft_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
});

afterAll(async () => {
  // Clean up test user
  if (mongoose.connection.db) {
    await mongoose.connection.db.collection('users').deleteMany({ username: testUsername });
  }
  await mongoose.disconnect();
});

describe('User Routes', () => {
  describe('GET /api/user/profile', () => {
    it('should return the user profile for a valid user', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username', testUsername);
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('nfts');
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
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });

    it('should return 500 on server error', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${jwtToken}`);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Server error');
    });
  });
}); 