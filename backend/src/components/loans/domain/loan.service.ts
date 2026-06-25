import { loanRepository } from '../data-access/loan.repository';
import { CreateLoanDto, UpdateLoanDto } from './loan.dto';
import { ApiError } from '../../../shared/middleware/error.middleware';
import { computeLoanFields, generateLoanNumber, calculateLoanStatus } from './loan.utils';
import { prisma } from '../../../shared/utils/prisma.client';
import { appCache, cacheKeys } from '../../../shared/utils/cache';

export class LoanService {
  async getAll(userId: string, page: number, limit: number, search?: string, status?: string, creditorId?: string, includeTotal = false) {
    return loanRepository.findAll(userId, page, limit, search, status, creditorId, includeTotal);
  }

  async getById(id: string, userId: string) {
    const loan = await loanRepository.findById(id, userId);

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    return loan;
  }

  async create(userId: string, data: CreateLoanDto) {
    // Validate input
    if (data.principal <= 0) {
      throw new ApiError(400, 'Principal must be greater than 0');
    }

    if (data.interestPerDay <= 0) {
      throw new ApiError(400, 'Interest per day must be greater than 0');
    }

    if (data.termDays <= 0) {
      throw new ApiError(400, 'Term days must be greater than 0');
    }

    // Check if creditor exists
    const creditor = await prisma.creditor.findUnique({
      where: { id: data.creditorId },
    });

    if (!creditor) {
      throw new ApiError(404, 'Creditor not found');
    }

    const releaseDate = new Date(data.releaseDate);
    const computed = computeLoanFields(data.principal, data.interestPerDay, data.termDays, releaseDate);

    // Get the next sequence number
    const sequence = await loanRepository.getNextLoanSequence(userId);

    const loan = await loanRepository.create(userId, {
      loanNumber: generateLoanNumber(sequence),
      creditorId: data.creditorId,
      principal: data.principal,
      interestPerDay: data.interestPerDay,
      termDays: data.termDays,
      releaseDate,
      ...computed,
      paidAmount: 0,
      remainingBalance: computed.totalPayable,
      status: 'Active',
    });

    appCache.delete(cacheKeys.dashboardSummary(userId));
    appCache.delete(cacheKeys.collectionsSummary(userId));
    return loan;
  }

  async update(id: string, userId: string, data: UpdateLoanDto) {
    const loan = await loanRepository.findById(id, userId);

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    const updateData: any = {};

    if (data.principal !== undefined) updateData.principal = data.principal;
    if (data.interestPerDay !== undefined) updateData.interestPerDay = data.interestPerDay;
    if (data.termDays !== undefined) updateData.termDays = data.termDays;
    if (data.releaseDate !== undefined) updateData.releaseDate = new Date(data.releaseDate);

    // Recompute fields if any numeric field changed
    if (Object.keys(updateData).length > 0) {
      const principal = updateData.principal ?? loan.principal;
      const interestPerDay = updateData.interestPerDay ?? loan.interestPerDay;
      const termDays = updateData.termDays ?? loan.termDays;
      const releaseDate = updateData.releaseDate ?? loan.releaseDate;

      const computed = computeLoanFields(principal, interestPerDay, termDays, releaseDate);
      Object.assign(updateData, computed);

      // Recalculate remaining balance based on new total payable and current paid amount
      const paidAmount = Number(loan.paidAmount) || 0;
      updateData.remainingBalance = Number(computed.totalPayable) - paidAmount;
    }

    await loanRepository.update(id, userId, updateData);
    appCache.delete(cacheKeys.dashboardSummary(userId));
    appCache.delete(cacheKeys.collectionsSummary(userId));
    return loanRepository.findById(id, userId);
  }

  async delete(id: string, userId: string) {
    const loan = await loanRepository.findById(id, userId);

    if (!loan) {
      throw new ApiError(404, 'Loan not found');
    }

    await loanRepository.softDelete(id, userId);
    appCache.delete(cacheKeys.dashboardSummary(userId));
    appCache.delete(cacheKeys.collectionsSummary(userId));
  }
}

export const loanService = new LoanService();
