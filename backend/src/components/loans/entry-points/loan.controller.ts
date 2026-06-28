import { Request, Response } from 'express';
import { loanService } from '../domain/loan.service';
import { asyncHandler } from '../../../shared/middleware/error.middleware';
import { clamp, parseBoolean, parsePositiveInt, parseSearch } from '../../../shared/utils/request.utils';

export const getLoans = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { page, limit, search, status, creditorId, includeTotal } = req.query;

  const parsedPage = parsePositiveInt(page, 1);
  const parsedLimit = clamp(parsePositiveInt(limit, 10), 1, 100);
  const parsedSearch = parseSearch(search);
  const parsedIncludeTotal = parseBoolean(includeTotal, false);

  const { loans, total, hasMore } = await loanService.getAll(
    userId,
    parsedPage,
    parsedLimit,
    parsedSearch,
    status as string,
    creditorId as string,
    parsedIncludeTotal
  );

  res.json({
    data: loans,
    total,
    hasMore,
    page: parsedPage,
    limit: parsedLimit,
  });
});

export const getLoanById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  const loan = await loanService.getById(id, userId);
  res.json(loan);
});

export const createLoan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const loan = await loanService.create(userId, req.body);
  res.status(201).json(loan);
});

export const updateLoan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  const loan = await loanService.update(id, userId, req.body);
  res.json(loan);
});

export const deleteLoan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  await loanService.delete(id, userId);
  res.json({ message: 'Loan archived successfully' });
});
