import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars explicitly
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Use the same config as the backend
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'insoctor';

// Simple templates without complex nested structures
const simpleTemplates = [
    {
        name: 'Daily Security Summary',
        description: 'Comprehensive overview of security events and alerts from the last 24 hours',
        category: 'security',
        widgets: [
            {
                id: 'total-alerts',
                type: 'kpi',
                title: 'Total Alerts',
                dataSource: 'wazuh-alerts',
                position: { x: 0, y: 0, w: 3, h: 2 }
            },
            {
                id: 'critical-alerts',
                type: 'kpi',
                title: 'Critical Alerts',
                dataSource: 'wazuh-alerts',
                position: { x: 3, y: 0, w: 3, h: 2 }
            },
            {
                id: 'alert-trend',
                type: 'line-chart',
                title: 'Alert Trend (Last 7 Days)',
                dataSource: 'wazuh-alerts',
                position: { x: 0, y: 2, w: 6, h: 4 }
            }
        ],
        isPublic: true,
        isPredefined: true,
        createdBy: 'system',
        version: 1,
        tags: ['security', 'daily', 'overview']
    },
    {
        name: 'Agent Health Dashboard',
        description: 'Real-time monitoring of agent health, connectivity, and performance',
        category: 'operational',
        widgets: [
            {
                id: 'total-agents',
                type: 'kpi',
                title: 'Total Agents',
                dataSource: 'wazuh-agents',
                position: { x: 0, y: 0, w: 3, h: 2 }
            },
            {
                id: 'active-agents',
                type: 'kpi',
                title: 'Active Agents',
                dataSource: 'wazuh-agents',
                position: { x: 3, y: 0, w: 3, h: 2 }
            },
            {
                id: 'agent-status-chart',
                type: 'pie-chart',
                title: 'Agent Status Distribution',
                dataSource: 'wazuh-agents',
                position: { x: 0, y: 2, w: 6, h: 4 }
            }
        ],
        isPublic: true,
        isPredefined: true,
        createdBy: 'system',
        version: 1,
        tags: ['operational', 'agents', 'monitoring']
    },
    {
        name: 'Weekly Threat Report',
        description: 'Executive summary of security threats and incidents from the past week',
        category: 'executive',
        widgets: [
            {
                id: 'total-incidents',
                type: 'kpi',
                title: 'Total Incidents',
                dataSource: 'iris-cases',
                position: { x: 0, y: 0, w: 4, h: 2 }
            },
            {
                id: 'critical-incidents',
                type: 'kpi',
                title: 'Critical Incidents',
                dataSource: 'iris-cases',
                position: { x: 4, y: 0, w: 4, h: 2 }
            },
            {
                id: 'incident-trend',
                type: 'area-chart',
                title: 'Incident Trend',
                dataSource: 'iris-cases',
                position: { x: 0, y: 2, w: 12, h: 4 }
            }
        ],
        isPublic: true,
        isPredefined: true,
        createdBy: 'system',
        version: 1,
        tags: ['executive', 'weekly', 'threats']
    }
];

async function seedTemplates() {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', MONGODB_URI.substring(0, 30) + '...');
        console.log('Database Name:', MONGODB_DB_NAME);

        // Connect with dbName option - same as backend
        await mongoose.connect(MONGODB_URI, {
            dbName: MONGODB_DB_NAME,
        });
        console.log('✅ Connected to MongoDB');
        console.log('Actual database:', mongoose.connection.db.databaseName);

        // Get the collection directly (bypass Mongoose schema validation)
        const db = mongoose.connection.db;
        const collection = db.collection('reporttemplates');

        // Delete existing predefined templates
        const deleteResult = await collection.deleteMany({ isPredefined: true });
        console.log(`Deleted ${deleteResult.deletedCount} existing predefined templates`);

        // Add timestamps
        const now = new Date();
        const templatesWithTimestamps = simpleTemplates.map(t => ({
            ...t,
            createdAt: now,
            updatedAt: now
        }));

        // Insert directly into the collection
        const insertResult = await collection.insertMany(templatesWithTimestamps);
        console.log(`✅ Inserted ${insertResult.insertedCount} predefined templates`);

        // Verify
        const count = await collection.countDocuments({ isPredefined: true });
        console.log(`Database now has ${count} predefined templates`);

        await mongoose.disconnect();
        console.log('✅ Done!');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

seedTemplates();
