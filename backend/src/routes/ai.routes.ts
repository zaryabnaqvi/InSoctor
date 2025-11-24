import { Router, Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting: 10 requests per minute per IP
const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: {
        success: false,
        error: 'Too many AI analysis requests. Please try again in a minute.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
    const isConfigured = aiService.isConfigured();
    res.json({
        success: true,
        configured: isConfigured,
        debug: {
            hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
            hasKey: !!process.env.AZURE_OPENAI_API_KEY,
            deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
            apiVersion: process.env.AZURE_OPENAI_API_VERSION
        },
        message: isConfigured
            ? 'AI service is configured and ready'
            : 'AI service is not configured. Please check Azure OpenAI credentials.',
    });
});

// Analyze alert endpoint
router.post('/analyze-alert', aiRateLimiter, async (req: Request, res: Response) => {
    try {
        const { alert } = req.body;

        // Validate request
        if (!alert) {
            return res.status(400).json({
                success: false,
                error: 'Alert data is required',
            });
        }

        // Validate required alert fields
        if (!alert.title || !alert.severity) {
            return res.status(400).json({
                success: false,
                error: 'Alert must include title and severity',
            });
        }

        // Check if AI service is configured
        if (!aiService.isConfigured()) {
            return res.status(503).json({
                success: false,
                error: 'AI service is not configured. Please contact your administrator.',
            });
        }

        console.log(`Analyzing alert: ${alert.title} (${alert.severity})`);

        // Analyze the alert
        const insights = await aiService.analyzeAlert(alert);

        res.json({
            success: true,
            data: insights,
        });
    } catch (error: any) {
        console.error('Error in AI analysis endpoint:', error);

        // Handle specific error types
        if (error.message?.includes('quota')) {
            return res.status(429).json({
                success: false,
                error: 'AI service quota exceeded. Please try again later.',
            });
        }

        if (error.message?.includes('not initialized')) {
            return res.status(503).json({
                success: false,
                error: 'AI service is not available. Please check configuration.',
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze alert with AI',
        });
    }
});

export default router;
