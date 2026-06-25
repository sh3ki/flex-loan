import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { getSummary, getDueToday, getDueThisWeek, getOverdue } from './collections.controller';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/due-today', getDueToday);
router.get('/due-this-week', getDueThisWeek);
router.get('/overdue', getOverdue);

export default router;
