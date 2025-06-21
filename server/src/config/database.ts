import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('MONGO_URI is not defined in the .env file');
}

export async function connectToDatabase() {
  try {
    await mongoose.connect(uri);
    console.log('Connected successfully to MongoDB via Mongoose');

    // Mongoose handles connection management and model indexing automatically.
    // If specific index creation is needed outside of schema definitions,
    // it can be done here, but typically it's defined in the model schema.

  } catch (error) {
    console.error('Could not connect to MongoDB via Mongoose', error);
    process.exit(1);
  }
}

// We no longer need getDb as Mongoose provides a global connection state. 