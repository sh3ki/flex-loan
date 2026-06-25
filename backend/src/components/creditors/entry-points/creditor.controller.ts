import { Request, Response } from 'express';
import { creditorService } from '../domain/creditor.service';
import { asyncHandler } from '../../../shared/middleware/error.middleware';
import { clamp, parseBoolean, parsePositiveInt, parseSearch } from '../../../shared/utils/request.utils';

export const getCreditors = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { page, limit, search, status, includeTotal } = req.query;

  const parsedPage = parsePositiveInt(page, 1);
  const parsedLimit = clamp(parsePositiveInt(limit, 10), 1, 25);
  const parsedSearch = parseSearch(search);
  const parsedIncludeTotal = parseBoolean(includeTotal, false);

  const { creditors, total, hasMore } = await creditorService.getAll(
    userId,
    parsedPage,
    parsedLimit,
    parsedSearch,
    status as string,
    parsedIncludeTotal
  );

  res.json({
    data: creditors,
    total,
    hasMore,
    page: parsedPage,
    limit: parsedLimit,
  });
});

export const getCreditorById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  const creditor = await creditorService.getById(id, userId);
  res.json(creditor);
});

export const createCreditor = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const creditor = await creditorService.create(userId, req.body);
  res.status(201).json(creditor);
});

export const updateCreditor = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  const creditor = await creditorService.update(id, userId, req.body);
  res.json(creditor);
});

export const deleteCreditor = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  await creditorService.delete(id, userId);
  res.json({ message: 'Creditor archived successfully' });
});

export const restoreCreditor = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  await creditorService.restore(id, userId);
  res.json({ message: 'Creditor restored successfully' });
});
