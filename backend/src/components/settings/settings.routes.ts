import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { getAdminSettings, getPublicSettings, updateSettings } from './settings.controller';

const router = Router();

router.get('/public', getPublicSettings);
router.get('/', authMiddleware, getAdminSettings);
router.put('/', authMiddleware, updateSettings);

export default router;
