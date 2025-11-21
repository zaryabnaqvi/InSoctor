import { Router, Request, Response } from 'express';
import wazuhService from '@/services/wazuh.service';
import logger from '@/config/logger';

const router = Router();

/**
 * GET /api/rules
 * Get all Wazuh rules
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const rules = await wazuhService.getRules();

        res.json({
            success: true,
            data: rules,
            total: rules.length,
        });
    } catch (error: any) {
        logger.error('Failed to fetch rules', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rules',
            message: error.message,
        });
    }
});

/**
 * GET /api/rules/:id
 * Get a specific rule by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const rule = await wazuhService.getRule(id);

        res.json({
            success: true,
            data: rule,
        });
    } catch (error: any) {
        logger.error(`Failed to fetch rule ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rule',
            message: error.message,
        });
    }
});

export default router;
