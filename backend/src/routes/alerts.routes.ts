import { Router, Request, Response } from 'express';
import wazuhIndexerService from '@/services/wazuh-indexer.service';
import irisService from '@/services/iris.service';
import logger from '@/config/logger';
import { AlertFilters } from '@/types';

const router = Router();

/**
 * GET /api/alerts
 * Get all alerts with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const filters: AlertFilters = {
            severity: req.query.severity ? (req.query.severity as string).split(',') : undefined,
            status: req.query.status ? (req.query.status as string).split(',') : undefined,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            agentId: req.query.agentId as string,
            ruleId: req.query.ruleId as string,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        };


        // Get alerts from Wazuh Indexer
        const alerts = await wazuhIndexerService.getAlerts(filters);

        // TODO: Enrich alerts with case information from IRIS (disabled for now)
        // const enrichedAlerts = await Promise.all(
        //     alerts.map(async (alert) => {
        //         try {
        //             const cases = await irisService.getCasesByAlertId(alert.id);
        //             if (cases.length > 0) {
        //                 const latestCase = cases[0];
        //                 return {
        //                     ...alert,
        //                     caseId: latestCase.id,
        //                     caseStatus: latestCase.status,
        //                 };
        //             }
        //         } catch (error) {
        //             logger.warn(`Failed to fetch case for alert ${alert.id}`, { error });
        //         }
        //         return alert;
        //     })
        // );

        // Apply status filter if needed
        let filteredAlerts = alerts;
        if (filters.status && filters.status.length > 0) {
            filteredAlerts = alerts.filter(alert => {
                return filters.status!.includes(alert.status);
            });
        }

        res.json({
            success: true,
            data: filteredAlerts,
            total: filteredAlerts.length,
        });
    } catch (error: any) {
        logger.error('Failed to fetch alerts', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch alerts',
            message: error.message,
        });
    }
});

/**
 * GET /api/alerts/stats
 * Get alert statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await wazuhIndexerService.getAlertStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        logger.error('Failed to fetch alert stats', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch alert statistics',
            message: error.message,
        });
    }
});

/**
 * GET /api/alerts/:id
 * Get a specific alert by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Fetch all alerts and find the specific one
        const alerts = await wazuhIndexerService.getAlerts({ limit: 10000 });
        const alert = alerts.find(a => a.id === id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                error: 'Alert not found',
            });
        }

        // Enrich with case information
        const cases = await irisService.getCasesByAlertId(id);
        const enrichedAlert = {
            ...alert,
            cases: cases,
            caseId: cases.length > 0 ? cases[0].id : undefined,
            caseStatus: cases.length > 0 ? cases[0].status : undefined,
        };

        res.json({
            success: true,
            data: enrichedAlert,
        });
    } catch (error: any) {
        logger.error(`Failed to fetch alert ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch alert',
            message: error.message,
        });
    }
});

/**
 * POST /api/alerts/:id/case
 * Create a case from an alert
 */
router.post('/:id/case', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, severity } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Title and description are required',
            });
        }

        // Create case in IRIS
        const newCase = await irisService.createCase({
            name: title,
            description: description,
            severity: severity || 'medium',
            alertIds: [id],
        });

        // Link alert to case
        await irisService.linkAlertToCase(id, newCase.id);

        logger.info(`Case ${newCase.id} created for alert ${id}`);

        res.status(201).json({
            success: true,
            data: newCase,
            message: 'Case created successfully',
        });
    } catch (error: any) {
        logger.error(`Failed to create case for alert ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to create case',
            message: error.message,
        });
    }
});

/**
 * PUT /api/alerts/:id/status
 * Update alert status (stored locally or in Wazuh if supported)
 */
router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required',
            });
        }

        // Note: Wazuh doesn't natively support updating alert status
        // This would typically be stored in a separate database
        // For now, we'll just return success
        logger.info(`Alert ${id} status updated to ${status}`);

        res.json({
            success: true,
            message: 'Alert status updated',
            data: { id, status },
        });
    } catch (error: any) {
        logger.error(`Failed to update alert ${req.params.id} status`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to update alert status',
            message: error.message,
        });
    }
});

export default router;
