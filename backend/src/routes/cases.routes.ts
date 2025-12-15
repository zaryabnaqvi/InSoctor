import { Router, Request, Response } from 'express';
import irisService from '@/services/iris.service';
import logger from '@/config/logger';
import { CaseFilters } from '@/types';

const router = Router();

/**
 * GET /api/cases
 * Get all cases with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const filters: CaseFilters = {
            status: req.query.status ? (req.query.status as string).split(',') : undefined,
            severity: req.query.severity ? (req.query.severity as string).split(',') : undefined,
            assignedTo: req.query.assignedTo as string,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        };

        const cases = await irisService.getCases(filters);

        res.json({
            success: true,
            data: cases,
            total: cases.length,
        });
    } catch (error: any) {
        logger.error('Failed to fetch cases', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch cases',
            message: error.message,
        });
    }
});

/**
 * GET /api/cases/stats
 * Get case statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await irisService.getCaseStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error: any) {
        logger.error('Failed to fetch case stats', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch case statistics',
            message: error.message,
        });
    }
});

/**
 * GET /api/cases/:id
 * Get a specific case by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const caseData = await irisService.getCase(id);

        if (!caseData) {
            return res.status(404).json({
                success: false,
                error: 'Case not found',
            });
        }

        res.json({
            success: true,
            data: caseData,
        });
    } catch (error: any) {
        logger.error(`Failed to fetch case ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch case',
            message: error.message,
        });
    }
});

/**
 * POST /api/cases
 * Create a new case
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { name, description, severity, classification, alertIds } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                error: 'Name and description are required',
            });
        }

        const newCase = await irisService.createCase({
            name,
            description,
            severity: severity || 'medium',
            classification,
            alertIds,
        });

        logger.info(`Case ${newCase.id} created successfully`);

        res.status(201).json({
            success: true,
            data: newCase,
            message: 'Case created successfully',
        });
    } catch (error: any) {
        logger.error('Failed to create case', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to create case',
            message: error.message,
        });
    }
});

/**
 * PUT /api/cases/:id
 * Update an existing case
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, severity, status } = req.body;

        const updatedCase = await irisService.updateCase(id, {
            name,
            description,
            severity,
            status,
        });

        logger.info(`Case ${id} updated successfully`);

        res.json({
            success: true,
            data: updatedCase,
            message: 'Case updated successfully',
        });
    } catch (error: any) {
        logger.error(`Failed to update case ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to update case',
            message: error.message,
        });
    }
});

/**
 * DELETE /api/cases/:id
 * Close a case
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await irisService.closeCase(id);

        logger.info(`Case ${id} closed successfully`);

        res.json({
            success: true,
            message: 'Case closed successfully',
        });
    } catch (error: any) {
        logger.error(`Failed to close case ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to close case',
            message: error.message,
        });
    }
});

/**
 * POST /api/cases/:id/alerts/:alertId
 * Link an alert to a case
 */
router.post('/:id/alerts/:alertId', async (req: Request, res: Response) => {
    try {
        const { id, alertId } = req.params;
        await irisService.linkAlertToCase(alertId, id);

        logger.info(`Alert ${alertId} linked to case ${id}`);

        res.json({
            success: true,
            message: 'Alert linked to case successfully',
        });
    } catch (error: any) {
        logger.error(`Failed to link alert ${req.params.alertId} to case ${req.params.id}`, {
            error: error.message
        });
        res.status(500).json({
            success: false,
            error: 'Failed to link alert to case',
            message: error.message,
        });
    }
});

export default router;
