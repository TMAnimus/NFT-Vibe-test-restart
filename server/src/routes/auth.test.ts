import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import authRoutes from './auth';
import { UserModel } from '../models/User';

jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPin');
      (UserModel.create as jest.Mock).mockResolvedValue({ username: 'testuser' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', pin: '1234' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'User created successfully.' });
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', expect.any(Number));
      expect(UserModel.create).toHaveBeenCalled();
    });

    it('should return 400 if username or pin is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: '', pin: '' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if pin is not 4 digits', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', pin: '12' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if username already exists', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue({ username: 'testuser' });
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', pin: '1234' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Username already exists.' });
    });

    it('should return 500 on server error', async () => {
      (UserModel.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', pin: '1234' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return a token', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue({ username: 'testuser', pin: 'hashedPin', _id: 'userId' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockToken');
      process.env.JWT_SECRET = 'secret';

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', pin: '1234' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ token: 'mockToken' });
      expect(UserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(bcrypt.compare).toHaveBeenCalledWith('1234', 'hashedPin');
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should return 400 if username or pin is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: '', pin: '' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if user is not found', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(null);
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nouser', pin: '1234' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid username or PIN.' });
    });

    it('should return 400 if pin is invalid', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue({ username: 'testuser', pin: 'hashedPin' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', pin: 'wrong' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid username or PIN.' });
    });

    it('should return 500 if JWT_SECRET is missing', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue({ username: 'testuser', pin: 'hashedPin', _id: 'userId' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      delete process.env.JWT_SECRET;
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', pin: '1234' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 500 on server error', async () => {
      (UserModel.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', pin: '1234' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
}); 