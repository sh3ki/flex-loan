import { Request, Response } from 'express';
import { asyncHandler } from '../../shared/middleware/error.middleware';
import { settingsService } from './settings.service';

export const getPublicSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getPublicSettings();
  res.set('Cache-Control', 'public, max-age=1800');
  res.json(settings);
});

export const getAdminSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getAdminSettings();
  res.set('Cache-Control', 'private, max-age=1800');
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const updated = await settingsService.updateSettings(req.body || {});
  res.json(updated);
});
