import { Request, Response } from 'express';
import { collectionsService } from './collections.service';
import { asyncHandler } from '../../shared/middleware/error.middleware';

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const summary = await collectionsService.getSummary(userId);
  res.set('Cache-Control', 'private, max-age=180'); // 3 minutes cache
  res.json(summary);
});

export const getDueToday = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const loans = await collectionsService.getDueToday(userId);
  res.json(loans);
});

export const getDueThisWeek = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const loans = await collectionsService.getDueThisWeek(userId);
  res.json(loans);
});

export const getOverdue = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const loans = await collectionsService.getOverdue(userId);
  res.json(loans);
});
