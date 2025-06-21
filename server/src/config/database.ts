import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI is not defined in the .env file');
}

let db: Db;

const client = new MongoClient(uri);

export async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    db = client.db();

    // Ensure a unique index on the username field for the users collection
    await db.collection('users').createIndex({ username: 1 }, { unique: true });

  } catch (error) {
    console.error('Could not connect to MongoDB', error);
    process.exit(1);
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Make sure connectToDatabase is called first.');
  }
  return db;
} 