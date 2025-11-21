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
    jwtSecret: string;
    frontendUrl: string;
    wazuh: ServiceConfig;
    wazuhIndexer: ServiceConfig;
    iris: ServiceConfig;
    shuffle: ServiceConfig;
    misp: ServiceConfig;
    polling: {
        alertInterval: number;
        logBatchSize: number;
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
    jwtSecret: getEnvVar('JWT_SECRET'),
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

    polling: {
        alertInterval: parseInt(process.env.ALERT_POLL_INTERVAL || '15', 10),
        logBatchSize: parseInt(process.env.LOG_STREAM_BATCH_SIZE || '100', 10),
    },
};

export default config;
