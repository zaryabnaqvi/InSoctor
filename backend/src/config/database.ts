import mongoose from 'mongoose';
import config from './index';
import logger from './logger';

class Database {
    private static instance: Database;
    private isConnected: boolean = false;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            logger.info('MongoDB already connected');
            return;
        }

        try {
            await mongoose.connect(config.mongodb.uri, {
                dbName: config.mongodb.dbName,
                maxPoolSize: 10,
                minPoolSize: 2,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.isConnected = true;
            logger.info(`MongoDB connected successfully to database: ${config.mongodb.dbName}`);

            // Handle connection events
            mongoose.connection.on('error', (error) => {
                logger.error('MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected');
                this.isConnected = true;
            });

        } catch (error: any) {
            logger.error('Failed to connect to MongoDB:', error.message);
            throw new Error(`MongoDB connection failed: ${error.message}`);
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info('MongoDB disconnected successfully');
        } catch (error: any) {
            logger.error('Error disconnecting from MongoDB:', error.message);
            throw error;
        }
    }

    public getConnection() {
        return mongoose.connection;
    }

    public isDbConnected(): boolean {
        return this.isConnected;
    }
}

export default Database.getInstance();
