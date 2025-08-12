import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import express from 'express';
import authRoutes from './auth';
import { authMiddleware } from '../middleware/auth';
import { connectTestDB, clearTestDB, closeTestDB } from '../test/db';
import jwt from 'jsonwebtoken';

// Use real mongoose test DB setup

// Mock the preference service to avoid DB dependency in these route tests
jest.mock('../services/notificationPreferenceService', () => {
  const buildTypes = (overrides?: any) => ({
    marketUpdate: true,
    listingCreated: true,
    listingSold: true,
    system: true,
    ...(overrides || {}),
  });
  return {
    __esModule: true,
    getOrCreateDefault: jest.fn(async (userId: string) => ({
      _id: 'pref1',
      userId,
      enabled: true,
      types: buildTypes(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    updatePreferences: jest.fn(async (userId: string, payload: any) => ({
      _id: 'pref1',
      userId,
      enabled: typeof payload?.enabled === 'boolean' ? payload.enabled : true,
      types: buildTypes(payload?.types),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    resetPreferences: jest.fn(async () => {}),
  };
});

// Import the route AFTER mocking its dependencies
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notificationsRoutes = require('./notifications').default;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prefService = require('../services/notificationPreferenceService');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);

let jwtToken = '';
const testUserId = '507f1f77bcf86cd799439011';

jest.setTimeout(30000);

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
  await connectTestDB();
  await clearTestDB();
  jwtToken = jwt.sign({ userId: testUserId, username: 'tester' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
});

afterAll(async () => {
  await closeTestDB();
});

describe('Notifications Preferences Routes', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  it('GET /preferences returns defaults when none exist', async () => {
    const res = await request(app)
      .get('/api/notifications/preferences')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(prefService.getOrCreateDefault).toHaveBeenCalled();
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('enabled', true);
    expect(res.body).toHaveProperty('types');
    expect(res.body.types).toMatchObject({
      marketUpdate: true,
      listingCreated: true,
      listingSold: true,
      system: true,
    });
  });

  it('PUT /preferences updates fields', async () => {
    // seed defaults via GET
    await request(app)
      .get('/api/notifications/preferences')
      .set('Authorization', `Bearer ${jwtToken}`);

    const res = await request(app)
      .put('/api/notifications/preferences')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ enabled: false, types: { marketUpdate: false, system: true } });

    // Debug: ensure response shape
    // eslint-disable-next-line no-console
    console.log('PUT response body:', res.body);
    expect(res.status).toBe(200);
    expect(prefService.updatePreferences).toHaveBeenCalled();
    expect(res.body.enabled).toBe(false);
    expect(res.body.types.marketUpdate).toBe(false);
    expect(res.body.types.system).toBe(true);
  });

  it('PUT /preferences rejects invalid payload', async () => {
    const res = await request(app)
      .put('/api/notifications/preferences')
      .set('Authorization', `Bearer ${jwtToken}`)
      // invalid: enabled should be boolean
      .send({ enabled: 'yes' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('DELETE /preferences resets to defaults', async () => {
    // set some prefs first
    await request(app)
      .put('/api/notifications/preferences')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ enabled: false, types: { listingSold: false } });

    const del = await request(app)
      .delete('/api/notifications/preferences')
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(del.status).toBe(204);
    expect(prefService.resetPreferences).toHaveBeenCalled();

    // new GET should recreate defaults
    const res = await request(app)
      .get('/api/notifications/preferences')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(res.body.enabled).toBe(true);
    expect(res.body.types).toMatchObject({
      listingSold: true,
    });
  });

  it('401 when missing auth', async () => {
    const res = await request(app).get('/api/notifications/preferences');
    expect(res.status).toBe(401);
  });
});


