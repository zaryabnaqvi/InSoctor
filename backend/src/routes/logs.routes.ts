import { Router, Request, Response } from 'express';
import wazuhIndexerService from '@/services/wazuh-indexer.service';
import logger from '@/config/logger';
import { LogFilters } from '@/types';

const router = Router();

/**
 * GET /api/logs
 * Get logs with pagination and filters
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const filters: LogFilters = {
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            agentId: req.query.agentId as string,
            agentName: req.query.agentName as string,
            decoder: req.query.decoder as string,
            search: req.query.search as string,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        };

        const logs = await wazuhIndexerService.getLogs(filters);

        res.json({
            success: true,
            data: logs,
            total: logs.length,
        });
    } catch (error: any) {
        logger.error('Failed to fetch logs', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch logs',
            message: error.message,
        });
    }
});

/**
 * GET /api/logs/stream
 * Server-Sent Events endpoint for real-time log streaming
 */
router.get('/stream', async (req: Request, res: Response) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    logger.info('Client connected to log stream');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Log stream connected' })}\n\n`);

    // Function to fetch and send logs
    const streamLogs = async () => {
        try {
            const filters: LogFilters = {
                startDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Last 5 minutes
                limit: 50,
            };

            const logs = await wazuhIndexerService.getLogs(filters);

            if (logs.length > 0) {
                res.write(`data: ${JSON.stringify({ type: 'logs', data: logs })}\n\n`);
            }
        } catch (error: any) {
            logger.error('Error streaming logs', { error: error.message });
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        }
    };

    // Stream logs every 5 seconds
    const interval = setInterval(streamLogs, 5000);

    // Initial fetch
    streamLogs();

    // Clean up on client disconnect
    req.on('close', () => {
        logger.info('Client disconnected from log stream');
        clearInterval(interval);
        res.end();
    });
});

export default router;
