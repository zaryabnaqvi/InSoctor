import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB Connection...');
console.log('URI present:', !!MONGODB_URI);

async function checkConnection() {
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is missing in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Successfully connected to MongoDB!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📚 Collections found:', collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('👋 Disconnected');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
}

checkConnection();
