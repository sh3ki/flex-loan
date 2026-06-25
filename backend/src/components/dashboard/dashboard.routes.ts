import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { getSummary } from './dashboard.controller';

const router = Router();

router.use(authMiddleware);
router.get('/summary', getSummary);

export default router;
