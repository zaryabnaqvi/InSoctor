import { Router, Request, Response } from 'express';
import wazuhIndexerService from '@/services/wazuh-indexer.service';
import logger from '@/config/logger';

const router = Router();

/**
 * GET /api/fim/alerts
 * Fetch FIM (File Integrity Monitoring) alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
    try {
        const filters = {
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10000,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            action: req.query.action as string,
            path: req.query.path as string,
            severity: req.query.severity as string
        };

        logger.info('Fetching FIM alerts', { filters });

        const result = await wazuhIndexerService.getFimAlerts(filters);

        res.json({
            success: true,
            data: result.alerts,
            total: result.total,
            aggregations: result.aggregations
        });
    } catch (error: any) {
        logger.error('Error fetching FIM alerts', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch FIM alerts',
            error: error.message
        });
    }
});

export default router;
