import { prisma } from '../../shared/utils/prisma.client';
import { appCache, cacheKeys } from '../../shared/utils/cache';

export class CollectionsService {
  async getDueToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.loan.findMany({
      where: {
        userId,
        deletedAt: null,
        dueDate: {
          gte: today,
          lt: tomorrow,
        },
        remainingBalance: { gt: 0 },
      },
      include: {
        creditor: true,
        payments: { orderBy: { paymentDate: 'desc' }, take: 1 },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getDueThisWeek(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return prisma.loan.findMany({
      where: {
        userId,
        deletedAt: null,
        dueDate: {
          gte: today,
          lt: nextWeek,
        },
        remainingBalance: { gt: 0 },
      },
      include: { creditor: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getOverdue(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loans = await prisma.loan.findMany({
      where: {
        userId,
        deletedAt: null,
        dueDate: { lt: today },
        remainingBalance: { gt: 0 },
      },
      include: { creditor: true },
      orderBy: { dueDate: 'asc' },
    });

    // Calculate days overdue
    return loans.map((loan) => ({
      ...loan,
      daysOverdue: Math.floor((today.getTime() - loan.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
    }));
  }

  async getSummary(userId: string) {
    const cacheKey = cacheKeys.collectionsSummary(userId);
    const cached = appCache.get<unknown>(cacheKey);
    if (cached) {
      return cached;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [dueToday, dueThisWeek, overdue] = await Promise.all([
      prisma.loan.aggregate({
        where: {
          userId,
          deletedAt: null,
          dueDate: { gte: today, lt: tomorrow },
          remainingBalance: { gt: 0 },
        },
        _count: { _all: true },
        _sum: { remainingBalance: true },
      }),
      prisma.loan.aggregate({
        where: {
          userId,
          deletedAt: null,
          dueDate: { gte: today, lt: nextWeek },
          remainingBalance: { gt: 0 },
        },
        _count: { _all: true },
        _sum: { remainingBalance: true },
      }),
      prisma.loan.aggregate({
        where: {
          userId,
          deletedAt: null,
          dueDate: { lt: today },
          remainingBalance: { gt: 0 },
        },
        _count: { _all: true },
        _sum: { remainingBalance: true },
      }),
    ]);

    const summary = {
      dueToday: {
        count: dueToday._count._all,
        totalAmount: Number(dueToday._sum.remainingBalance || 0),
        loans: [],
      },
      dueThisWeek: {
        count: dueThisWeek._count._all,
        totalAmount: Number(dueThisWeek._sum.remainingBalance || 0),
        loans: [],
      },
      overdue: {
        count: overdue._count._all,
        totalAmount: Number(overdue._sum.remainingBalance || 0),
        loans: [],
      },
    };

    appCache.set(cacheKey, summary, 30 * 1000);
    return summary;
  }
}

export const collectionsService = new CollectionsService();
