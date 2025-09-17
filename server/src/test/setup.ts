import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectTestDB, clearTestDB, closeTestDB } from './db';

// Load environment variables from .env.test file for testing
dotenv.config({ path: '.env.test' });

// Set test-specific environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Configure test database URI
const defaultUri = 'mongodb://127.0.0.1:27017/nft-game-test';
const baseUri = process.env.MONGO_URI || defaultUri;
// Always ensure we're using the test database
const testUri = baseUri.replace(/\/[^/]+$/, '/nft-game-test');
process.env.MONGO_URI = testUri;

console.log('Test database URI:', process.env.MONGO_URI);

// Increase timeout for database operations (30 seconds)
jest.setTimeout(30000);

// Global test setup and teardown
beforeAll(async () => {
  try {
    // Ensure clean disconnect first
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Establish fresh connection
    await connectTestDB();
  } catch (error) {
    console.error('Fatal error in test setup:', error);
    // Fail fast on setup errors
    process.exit(1);
  }
});

beforeEach(async () => {
  try {
    // Verify/restore connection and clear data
    const conn = await connectTestDB();
    if (!conn || !conn.connection || conn.connection.readyState !== 1) {
      throw new Error('Failed to establish database connection');
    }
    await clearTestDB();
  } catch (error) {
    console.error('Error in test preparation:', error);
    throw error;
  }
});

afterEach(async () => {
  try {
    // Clean up data but keep connection
    await clearTestDB();
  } catch (error) {
    // Log cleanup errors but don't fail tests
    console.warn('Warning: Error in test cleanup:', error);
  }
});

afterAll(async () => {
  try {
    // Clean final disconnect
    await closeTestDB();
  } catch (error) {
    // Log but don't throw on final cleanup
    console.error('Warning: Error in final cleanup:', error);
  } finally {
    // Force disconnect if still connected
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch (e) {
        console.warn('Error forcing final disconnect:', e);
      }
    }
  }
});
