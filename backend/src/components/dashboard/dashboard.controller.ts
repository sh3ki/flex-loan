import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { asyncHandler } from '../../shared/middleware/error.middleware';

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const summary = await dashboardService.getSummary(userId);
  res.set('Cache-Control', 'private, max-age=180'); // 3 minutes cache
  res.json(summary);
});
