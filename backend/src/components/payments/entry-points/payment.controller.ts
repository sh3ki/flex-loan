import { Request, Response } from 'express';
import { paymentService } from '../domain/payment.service';
import { asyncHandler } from '../../../shared/middleware/error.middleware';
import { clamp, parseBoolean, parsePositiveInt, parseSearch } from '../../../shared/utils/request.utils';

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { page, limit, search, loanId, creditorId, includeTotal } = req.query;

  const parsedPage = parsePositiveInt(page, 1);
  const parsedLimit = clamp(parsePositiveInt(limit, 10), 1, 25);
  const parsedSearch = parseSearch(search);
  const parsedIncludeTotal = parseBoolean(includeTotal, false);

  const { payments, total, hasMore } = await paymentService.getAll(
    userId,
    parsedPage,
    parsedLimit,
    parsedSearch,
    loanId as string,
    creditorId as string,
    parsedIncludeTotal
  );

  res.json({
    data: payments,
    total,
    hasMore,
    page: parsedPage,
    limit: parsedLimit,
  });
});

export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  const payment = await paymentService.getById(id, userId);
  res.json(payment);
});

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const payment = await paymentService.create(userId, req.body);
  res.status(201).json(payment);
});

export const updatePayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  const payment = await paymentService.update(id, userId, req.body);
  res.json(payment);
});

export const deletePayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || '';
  const { id } = req.params as { id: string };

  await paymentService.delete(id, userId);
  res.json({ message: 'Payment deleted successfully' });
});
