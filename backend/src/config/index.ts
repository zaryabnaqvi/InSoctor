import dotenv from 'dotenv';

dotenv.config();

interface ServiceConfig {
    url: string;
    apiKey?: string;
    username?: string;
    password?: string;
    verifySSL: boolean;
}

interface Config {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    wazuh: ServiceConfig;
    wazuhIndexer: ServiceConfig;
    iris: ServiceConfig;
    shuffle: ServiceConfig;
    misp: ServiceConfig;
    mongodb: {
        uri: string;
        dbName: string;
    };
    polling: {
        alertInterval: number;
        logBatchSize: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

const getBooleanEnv = (key: string, defaultValue: boolean = false): boolean => {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
};

export const config: Config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:5173'),

    wazuh: {
        url: getEnvVar('WAZUH_API_URL'),
        username: getEnvVar('WAZUH_API_USER'),
        password: getEnvVar('WAZUH_API_PASSWORD'),
        verifySSL: getBooleanEnv('WAZUH_VERIFY_SSL', false),
    },

    wazuhIndexer: {
        url: getEnvVar('WAZUH_INDEXER_URL'),
        username: getEnvVar('WAZUH_INDEXER_USER', 'admin'),
        password: getEnvVar('WAZUH_INDEXER_PASSWORD', 'admin'),
        verifySSL: getBooleanEnv('WAZUH_INDEXER_VERIFY_SSL', false),
    },

    iris: {
        url: getEnvVar('IRIS_API_URL'),
        apiKey: getEnvVar('IRIS_API_KEY'),
        verifySSL: getBooleanEnv('IRIS_VERIFY_SSL', false),
    },

    shuffle: {
        url: getEnvVar('SHUFFLE_API_URL'),
        apiKey: getEnvVar('SHUFFLE_API_KEY'),
        verifySSL: getBooleanEnv('SHUFFLE_VERIFY_SSL', false),
    },

    misp: {
        url: getEnvVar('MISP_API_URL'),
        apiKey: getEnvVar('MISP_API_KEY'),
        verifySSL: getBooleanEnv('MISP_VERIFY_SSL', false),
    },

    mongodb: {
        uri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017'),
        dbName: getEnvVar('MONGODB_DB_NAME', 'insoctor'),
    },

    polling: {
        alertInterval: parseInt(process.env.ALERT_POLL_INTERVAL || '15', 10),
        logBatchSize: parseInt(process.env.LOG_STREAM_BATCH_SIZE || '100', 10),
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-prod',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
};

export default config;
