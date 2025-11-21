import { Router, Request, Response } from 'express';
import wazuhService from '@/services/wazuh.service';
import logger from '@/config/logger';

const router = Router();

/**
 * GET /api/agents
 * Get all Wazuh agents
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const agents = await wazuhService.getAgents();

        res.json({
            success: true,
            data: agents,
            total: agents.length,
        });
    } catch (error: any) {
        logger.error('Failed to fetch agents', { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agents',
            message: error.message,
        });
    }
});

/**
 * GET /api/agents/:id
 * Get a specific agent by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const agent = await wazuhService.getAgent(id);

        res.json({
            success: true,
            data: agent,
        });
    } catch (error: any) {
        logger.error(`Failed to fetch agent ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agent',
            message: error.message,
        });
    }
});

/**
 * POST /api/agents/:id/restart
 * Restart an agent
 */
router.post('/:id/restart', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await wazuhService.restartAgent(id);

        res.json({
            success: true,
            data: result,
            message: `Agent ${id} restart command sent`,
        });
    } catch (error: any) {
        logger.error(`Failed to restart agent ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to restart agent',
            message: error.message,
        });
    }
});

/**
 * DELETE /api/agents/:id
 * Delete an agent
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await wazuhService.deleteAgent(id);

        res.json({
            success: true,
            data: result,
            message: `Agent ${id} deleted successfully`,
        });
    } catch (error: any) {
        logger.error(`Failed to delete agent ${req.params.id}`, { error: error.message });
        res.status(500).json({
            success: false,
            error: 'Failed to delete agent',
            message: error.message,
        });
    }
});

export default router;
