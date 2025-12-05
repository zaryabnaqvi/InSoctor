import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/insoctor';

async function checkTemplatesDetail() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        console.log('Database:', mongoose.connection.db.databaseName);

        const db = mongoose.connection.db;
        const collection = db.collection('reporttemplates');

        // Get count
        const count = await collection.countDocuments({ isPublic: true });
        console.log(`Templates with isPublic = true (boolean): ${count}`);

        const countStr = await collection.countDocuments({ isPublic: "true" });
        console.log(`Templates with isPublic = "true" (string): ${countStr}`);

        // Get raw documents
        const templates = await collection.find({}).toArray();
        console.log(`\nTotal templates: ${templates.length}`);

        templates.forEach(t => {
            console.log(`\nTemplate: ${t.name}`);
            console.log(`  _id: ${t._id}`);
            console.log(`  isPublic: ${t.isPublic} (type: ${typeof t.isPublic})`);
            console.log(`  category: ${t.category}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}

checkTemplatesDetail();
