import { creditorRepository } from '../data-access/creditor.repository';
import { CreateCreditorDto, UpdateCreditorDto } from './creditor.dto';
import { ApiError } from '../../../shared/middleware/error.middleware';
import { appCache, cacheKeys } from '../../../shared/utils/cache';

export class CreditorService {
  async getAll(userId: string, page: number, limit: number, search?: string, status?: string, includeTotal = false) {
    return creditorRepository.findAll(userId, page, limit, search, status, includeTotal);
  }

  async getById(id: string, userId: string) {
    const creditor = await creditorRepository.findById(id, userId);

    if (!creditor) {
      throw new ApiError(404, 'Creditor not found');
    }

    return creditor;
  }

  async create(userId: string, data: CreateCreditorDto) {
    if (!data.firstName || !data.lastName) {
      throw new ApiError(400, 'First name and last name are required');
    }

    const creditor = await creditorRepository.create(userId, {
      ...data,
      status: 'active',
    });

    appCache.delete(cacheKeys.dashboardSummary(userId));
    return creditor;
  }

  async update(id: string, userId: string, data: UpdateCreditorDto) {
    const creditor = await creditorRepository.findById(id, userId);

    if (!creditor) {
      throw new ApiError(404, 'Creditor not found');
    }

    await creditorRepository.update(id, userId, data);
    appCache.delete(cacheKeys.dashboardSummary(userId));
    appCache.delete(cacheKeys.collectionsSummary(userId));
    return creditorRepository.findById(id, userId);
  }

  async delete(id: string, userId: string) {
    const creditor = await creditorRepository.findById(id, userId);

    if (!creditor) {
      throw new ApiError(404, 'Creditor not found');
    }

    await creditorRepository.softDelete(id, userId);
    appCache.delete(cacheKeys.dashboardSummary(userId));
    appCache.delete(cacheKeys.collectionsSummary(userId));
  }

  async restore(id: string, userId: string) {
    await creditorRepository.restore(id, userId);
    appCache.delete(cacheKeys.dashboardSummary(userId));
    appCache.delete(cacheKeys.collectionsSummary(userId));
  }
}

export const creditorService = new CreditorService();
