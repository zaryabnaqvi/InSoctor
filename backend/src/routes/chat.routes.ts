import { Router, Request, Response } from 'express';
import { chatService } from '../services/chat.service';

const router = Router();

/**
 * POST /api/chat
 * Send a message to the AI assistant
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { message, conversationId } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (message.length > 2000) {
            return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
        }

        const response = await chatService.chat(message, conversationId);

        res.json(response);
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({
            error: 'Failed to process message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * DELETE /api/chat/:conversationId
 * Clear a conversation
 */
router.delete('/:conversationId', async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        chatService.clearConversation(conversationId);
        res.json({ success: true, message: 'Conversation cleared' });
    } catch (error) {
        console.error('Clear conversation error:', error);
        res.status(500).json({ error: 'Failed to clear conversation' });
    }
});

export default router;
