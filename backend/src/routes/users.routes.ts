import { Router } from 'express';
import userService from '../services/user.service';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List users (Admin only)
router.get('/', authorize('admin'), async (req, res) => {
    try {
        const users = await userService.getAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Create user (Admin only)
router.post('/', authorize('admin'), async (req, res) => {
    try {
        const user = await userService.create(req.body);
        res.status(201).json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Update user (Admin only)
router.put('/:id', authorize('admin'), async (req, res) => {
    try {
        const user = await userService.update(req.params.id, req.body);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Delete user (Admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        // Prevent deleting self
        if (req.user?.id === req.params.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const deleted = await userService.delete(req.params.id);
        if (deleted) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
