import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insoctor';

async function checkTemplates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('reporttemplates');

        const templates = await collection.find({}).toArray();
        console.log(`Found ${templates.length} templates`);

        templates.forEach(t => {
            console.log(`- ${t.name} (isPublic: ${t.isPublic}, isPredefined: ${t.isPredefined}, createdBy: ${t.createdBy})`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

checkTemplates();
