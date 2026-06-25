import { paymentRepository } from '../data-access/payment.repository';
import { CreatePaymentDto, UpdatePaymentDto } from './payment.dto';
import { generatePaymentNumber } from './payment.utils';
import { ApiError } from '../../../shared/middleware/error.middleware';
import { calculateLoanStatus } from '../../loans/domain/loan.utils';
import { prisma } from '../../../shared/utils/prisma.client';
import { appCache, cacheKeys } from '../../../shared/utils/cache';

export class PaymentService {
  async getAll(userId: string, page: number, limit: number, search?: string, loanId?: string, creditorId?: string, includeTotal = false) {
    return paymentRepository.findAll(userId, page, limit, search, loanId, creditorId, includeTotal);
  }

  async getById(id: string, userId: string) {
    const payment = await paymentRepository.findById(id, userId);

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    return payment;
  }

  async create(userId: string, data: CreatePaymentDto) {
    // Validate input
    if (data.amount <= 0) {
      throw new ApiError(400, 'Payment amount must be greater than 0');
    }

    // Check if loan exists
    const loan = await prisma.loan.findUnique({
      where: { id: data.loanId },
    });

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    // Check if payment amount exceeds remaining balance
    if (data.amount > Number(loan.remainingBalance)) {
      throw new ApiError(400, `Payment amount cannot exceed remaining balance of ${loan.remainingBalance}`);
    }

    // Get next payment sequence for this loan
    const paymentSequence = await paymentRepository.getNextPaymentSequence(data.loanId);
    const paymentNumber = generatePaymentNumber(loan.loanNumber, paymentSequence);

    // Create payment
    const payment = await paymentRepository.create(userId, {
      loanId: data.loanId,
      amount: data.amount,
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      paymentNumber,
    });

    // Update loan with new payment
    const newPaidAmount = Number(loan.paidAmount) + data.amount;
    const newRemainingBalance = Number(loan.totalPayable) - newPaidAmount;
    const newStatus = calculateLoanStatus(newRemainingBalance, loan.dueDate, newPaidAmount);

    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        paidAmount: newPaidAmount,
        remainingBalance: newRemainingBalance,
        status: newStatus,
        ...(newRemainingBalance === 0 && { completedAt: new Date() }),
      },
    });

    appCache.delete(cacheKeys.dashboardSummary(userId));
    appCache.delete(cacheKeys.collectionsSummary(userId));
    return payment;
  }

  async update(id: string, userId: string, data: UpdatePaymentDto) {
    const payment = await paymentRepository.findById(id, userId);

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    const loan = await prisma.loan.findUnique({
      where: { id: payment.loanId },
    });

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    // Calculate difference in payment amount
    const oldAmount = Number(payment.amount);
    const newAmount = data.amount ?? oldAmount;
    const difference = newAmount - oldAmount;

    // Check if new payment would exceed remaining balance
    if (difference > 0 && newAmount > Number(loan.remainingBalance) + oldAmount) {
      throw new ApiError(400, `Payment amount cannot exceed remaining balance`);
    }

    const updateData: any = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paymentDate !== undefined) updateData.paymentDate = new Date(data.paymentDate);
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.referenceNumber !== undefined) updateData.referenceNumber = data.referenceNumber;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await paymentRepository.update(id, userId, updateData);

    // Update loan if amount changed
    if (difference !== 0) {
      const newPaidAmount = Number(loan.paidAmount) + difference;
      const newRemainingBalance = Number(loan.totalPayable) - newPaidAmount;
      const newStatus = calculateLoanStatus(newRemainingBalance, loan.dueDate, newPaidAmount);

      await prisma.loan.update({
        where: { id: loan.id },
        data: {
          paidAmount: newPaidAmount,
          remainingBalance: newRemainingBalance,
          status: newStatus,
          ...(newRemainingBalance === 0 && { completedAt: new Date() }),
        },
      });

      appCache.delete(cacheKeys.dashboardSummary(userId));
      appCache.delete(cacheKeys.collectionsSummary(userId));
    }

    return paymentRepository.findById(id, userId);
  }

  async delete(id: string, userId: string) {
    const payment = await paymentRepository.findById(id, userId);

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    const loan = await prisma.loan.findUnique({
      where: { id: payment.loanId },
    });

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    // Reverse the payment
    const newPaidAmount = Number(loan.paidAmount) - Number(payment.amount);
    const newRemainingBalance = Number(loan.totalPayable) - newPaidAmount;
    const newStatus = calculateLoanStatus(newRemainingBalance, loan.dueDate, newPaidAmount);

    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        paidAmount: newPaidAmount,
        remainingBalance: newRemainingBalance,
        status: newStatus,
        completedAt: newRemainingBalance > 0 ? null : loan.completedAt,
      },
    });

    await paymentRepository.softDelete(id, userId);
    appCache.delete(cacheKeys.dashboardSummary(userId));
    appCache.delete(cacheKeys.collectionsSummary(userId));
  }
}

export const paymentService = new PaymentService();
