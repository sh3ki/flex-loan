import { Router } from 'express';
import { login, refresh, logout, validate, updateProfile } from './auth.controller';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/validate', authMiddleware, validate);
router.put('/profile', authMiddleware, updateProfile);

export default router;
