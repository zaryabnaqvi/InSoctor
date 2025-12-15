import { Router } from 'express';
import jwt from 'jsonwebtoken';
import userService from '../services/user.service';
import { authenticate } from '../middleware/auth.middleware';
import { config } from '../config';

const router = Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await userService.findByEmail(email);
        if (!user || !(await userService.validatePassword(user, password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const { password: _, ...userWithoutPassword } = user;
        const token = jwt.sign(userWithoutPassword, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as any
        });

        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/me', authenticate, (req, res) => {
    res.json(req.user);
});

export default router;
