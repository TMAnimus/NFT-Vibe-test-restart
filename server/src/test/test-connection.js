import mongoose from 'mongoose';

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        const connection = await mongoose.connect('mongodb://127.0.0.1:27017/nft-game-test');
        console.log('Connection state:', mongoose.connection.readyState);
        console.log('Connected successfully!');
        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (err) {
        console.error('Connection error:', err);
    }
}

testConnection();
