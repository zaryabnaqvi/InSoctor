import { Router, Request, Response } from 'express';
import reportService from '../services/report.service';
import { aiReportService } from '../services/ai-report.service';
import { authenticate as authMiddleware } from '../middleware/auth.middleware';
import logger from '../config/logger';
import { ReportTemplateModel } from '../models/report.model';

const router = Router();

/**
 * Get all templates (public + user's templates)
 * GET /api/reports/templates?category=security&tags=compliance
 * This endpoint uses OPTIONAL auth - shows predefined templates even if not logged in
 */
router.get('/templates', async (req: Request, res: Response) => {
    try {
        // Try to get user from token if present
        let userId: string | null = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = await import('jsonwebtoken');
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
                userId = decoded.id;
            } catch (e) {
                // Token invalid or expired - just show public templates
                logger.debug('Token verification failed, showing only public templates');
            }
        }

        const { category, tags } = req.query;

        // Build query - show user's templates OR public templates
        const query: any = userId
            ? { $or: [{ createdBy: userId }, { isPublic: true }] }
            : { isPublic: true };

        if (category) query.category = category;
        if (tags) {
            query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
        }

        const templates = await ReportTemplateModel.find(query).sort({ updatedAt: -1 });
        logger.debug(`Retrieved ${templates.length} templates (userId: ${userId || 'anonymous'})`);

        res.json({
            success: true,
            data: templates.map(t => t.toObject()),
            total: templates.length
        });
    } catch (error: any) {
        logger.error('Error retrieving templates', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// All other report routes require authentication
router.use(authMiddleware);

/**
 * Create a new report template
 * POST /api/reports/templates
 */
router.post('/templates', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const template = await reportService.createTemplate(userId, req.body);

        res.status(201).json({
            success: true,
            data: template
        });
    } catch (error: any) {
        logger.error('Error creating report template', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get a specific template
 * GET /api/reports/templates/:id
 */
router.get('/templates/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const template = await reportService.getTemplate(userId, req.params.id);

        res.json({
            success: true,
            data: template
        });
    } catch (error: any) {
        logger.error('Error retrieving template', { error: error.message });
        res.status(error.message.includes('not found') ? 404 : 500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Update a template
 * PUT /api/reports/templates/:id
 */
router.put('/templates/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const template = await reportService.updateTemplate(userId, req.params.id, req.body);

        res.json({
            success: true,
            data: template
        });
    } catch (error: any) {
        logger.error('Error updating template', { error: error.message });
        res.status(error.message.includes('not found') ? 404 : 500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Delete a template
 * DELETE /api/reports/templates/:id
 */
router.delete('/templates/:id', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await reportService.deleteTemplate(userId, req.params.id);

        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error: any) {
        logger.error('Error deleting template', { error: error.message });
        res.status(error.message.includes('not found') ? 404 : 500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Generate a report from a template
 * POST /api/reports/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const report = await reportService.generateReport(userId, req.body);

        res.json({
            success: true,
            data: report
        });
    } catch (error: any) {
        logger.error('Error generating report', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Query data with filters
 * POST /api/reports/data/query
 */
router.post('/data/query', async (req: Request, res: Response) => {
    try {
        const data = await reportService.queryData(req.body);

        res.json({
            success: true,
            data,
            total: data.length
        });
    } catch (error: any) {
        logger.error('Error querying data', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get available data sources
 * GET /api/reports/data/sources
 */
router.get('/data/sources', async (req: Request, res: Response) => {
    try {
        const sources = reportService.getAvailableDataSources();

        res.json({
            success: true,
            data: sources
        });
    } catch (error: any) {
        logger.error('Error getting data sources', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==========================================
// AI-POWERED REPORT GENERATION (Milestone 2)
// ==========================================

/**
 * Generate a report from natural language
 * POST /api/reports/ai/generate
 * Body: { prompt: string, context?: { dataSources?: string[] } }
 */
router.post('/ai/generate', async (req: Request, res: Response) => {
    try {
        if (!aiReportService.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'AI service is not configured. Please check Azure OpenAI credentials.',
                details: aiReportService.getInitializationError()
            });
        }

        const { prompt, context } = req.body;
        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: prompt'
            });
        }

        logger.info('AI Report generation requested', { prompt: prompt.substring(0, 100) });
        const result = await aiReportService.generateReportFromNLP(prompt, context);

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        logger.error('Error in AI report generation', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get AI insights from data
 * POST /api/reports/ai/insights
 * Body: { data: any[], context: string }
 */
router.post('/ai/insights', async (req: Request, res: Response) => {
    try {
        if (!aiReportService.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'AI service is not configured. Please check Azure OpenAI credentials.'
            });
        }

        const { data, context } = req.body;
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: data (must be an array)'
            });
        }

        logger.info('AI Insights requested', { dataCount: data.length, context });
        const insights = await aiReportService.generateInsights(data, context || 'General analysis');

        res.json({
            success: true,
            data: insights
        });
    } catch (error: any) {
        logger.error('Error generating AI insights', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get AI widget suggestions
 * POST /api/reports/ai/suggest-widgets
 * Body: { dataSource: string, purpose?: string }
 */
router.post('/ai/suggest-widgets', async (req: Request, res: Response) => {
    try {
        if (!aiReportService.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'AI service is not configured. Please check Azure OpenAI credentials.'
            });
        }

        const { dataSource, purpose } = req.body;
        if (!dataSource) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: dataSource'
            });
        }

        logger.info('AI Widget suggestions requested', { dataSource, purpose });
        const suggestions = await aiReportService.suggestWidgets(dataSource, purpose);

        res.json({
            success: true,
            data: suggestions
        });
    } catch (error: any) {
        logger.error('Error suggesting widgets', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Generate executive summary from report data
 * POST /api/reports/ai/executive-summary
 * Body: { name: string, dateRange?: string, widgets: any[] }
 */
router.post('/ai/executive-summary', async (req: Request, res: Response) => {
    try {
        if (!aiReportService.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'AI service is not configured. Please check Azure OpenAI credentials.'
            });
        }

        logger.info('AI Executive summary requested');
        const summary = await aiReportService.generateExecutiveSummary(req.body);

        res.json({
            success: true,
            data: { summary }
        });
    } catch (error: any) {
        logger.error('Error generating executive summary', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Schedule a report (Milestone 5)
 * POST /api/reports/schedule
 */
router.post('/schedule', async (req: Request, res: Response) => {
    res.status(501).json({
        success: false,
        error: 'Report scheduling will be implemented in Milestone 5'
    });
});

/**
 * Export report (Milestone 5)
 * POST /api/reports/:id/export
 */
router.post('/:id/export', async (req: Request, res: Response) => {
    res.status(501).json({
        success: false,
        error: 'Report export will be implemented in Milestone 5'
    });
});

export default router;
