import { prisma } from '../../../shared/utils/prisma.client';

export class CreditorRepository {
  async findAll(userId: string, page = 1, limit = 10, search?: string, status?: string, includeTotal = false) {
    const skip = (page - 1) * limit;
    const where: any = { userId, deletedAt: null };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { contactNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (includeTotal) {
      const [creditors, total] = await Promise.all([
        prisma.creditor.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.creditor.count({ where }),
      ]);

      return { creditors, total, hasMore: skip + creditors.length < total };
    }

    const creditors = await prisma.creditor.findMany({
      where,
      skip,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = creditors.length > limit;
    return {
      creditors: hasMore ? creditors.slice(0, limit) : creditors,
      total: null,
      hasMore,
    };
  }

  async findById(id: string, userId: string) {
    return prisma.creditor.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        loans: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(userId: string, data: any) {
    return prisma.creditor.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    return prisma.creditor.updateMany({
      where: { id, userId, deletedAt: null },
      data,
    });
  }

  async softDelete(id: string, userId: string) {
    return prisma.creditor.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  async restore(id: string, userId: string) {
    return prisma.creditor.updateMany({
      where: { id, userId },
      data: { deletedAt: null, status: 'active' },
    });
  }
}

export const creditorRepository = new CreditorRepository();
