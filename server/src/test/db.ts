import mongoose from 'mongoose';

// Connect to test database
export const connectTestDB = async (): Promise<typeof mongoose> => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nft-game-test';

    // First check if we already have an active connection
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      // Already connected to the right database
      return mongoose;
    }

    // If there's any connection, disconnect first
    if (mongoose.connection) {
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        console.warn('Error disconnecting:', disconnectError);
        // Continue even if disconnect fails
      }
    }

    console.log('Connecting to MongoDB...');
    console.log('Test database URI:', uri);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10
    });

    // Verify connection
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      throw new Error('Failed to establish MongoDB connection');
    }

    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export const clearTestDB = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Attempted to clear non-test database!');
  }

  try {
    let connection = mongoose.connection;

    // If no connection or not connected, establish connection
    if (!connection || connection.readyState !== 1) {
      console.log('No active connection, establishing new connection...');
      await connectTestDB();
      connection = mongoose.connection;
    }

    // Re-check connection status
    if (!connection || !connection.db) {
      throw new Error('Failed to establish database connection');
    }

    // Get collection list safely
    let collections;
    try {
      collections = await connection.db.collections();
    } catch (err) {
      console.error('Error getting collections:', err);
      throw new Error('Failed to get database collections');
    }

    if (!collections || collections.length === 0) {
      console.log('No collections to clear');
      return;
    }

    // Delete all documents in parallel
    const results = await Promise.allSettled(
      collections.map(async collection => {
        try {
          await collection.deleteMany({});
          console.log(`Cleared collection ${collection.collectionName}`);
          return true;
        } catch (err) {
          console.warn(`Failed to clear collection ${collection.collectionName}:`, err);
          return false;
        }
      })
    );

    // Check if any collections failed to clear
    const failedCount = results.filter(result => 
      result.status === 'rejected' || (result.status === 'fulfilled' && !result.value)
    ).length;

    if (failedCount > 0) {
      console.warn(`${failedCount} collections failed to clear`);
    } else {
      console.log('Database cleanup completed successfully');
    }
  } catch (error) {
    console.error('Error clearing test DB:', error);
    throw error;
  }
};

export const closeTestDB = async (): Promise<void> => {
  try {
    // Check for connection
    if (!mongoose.connection) {
      console.log('No mongoose connection object exists');
      return;
    }

    // Check for active connection
    if (mongoose.connection.readyState !== 1) {
      console.log('No active connection to close');
      return;
    }

    // Attempt disconnection
    try {
      await mongoose.disconnect();
      console.log('Successfully disconnected from MongoDB');
    } catch (disconnectError) {
      console.error('Error during disconnect:', disconnectError);
    }
  } catch (error) {
    console.error('Error in closeTestDB:', error);
    // Don't throw on cleanup errors
  }
};
