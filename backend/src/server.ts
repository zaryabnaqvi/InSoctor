import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './config/logger';

// Import routes
import alertsRoutes from './routes/alerts.routes';
import logsRoutes from './routes/logs.routes';
import casesRoutes from './routes/cases.routes';
import rulesRoutes from './routes/rules.routes';
import agentsRoutes from './routes/agents.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
}));

// Rate limiting - more generous for development/polling
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased to 1000 requests per 15 minutes (allows frequent polling)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API routes
app.use('/api/alerts', alertsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/agents', agentsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
    });

    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: config.nodeEnv === 'development' ? err.message : undefined,
    });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    logger.info(`🚀 INSOCtor Backend API running on port ${PORT}`);
    logger.info(`📊 Environment: ${config.nodeEnv}`);
    logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
    logger.info(`🛡️  Wazuh: ${config.wazuh.url}`);
    logger.info(`📋 IRIS: ${config.iris.url}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

export default app;
