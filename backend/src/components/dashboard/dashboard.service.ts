import { prisma } from '../../shared/utils/prisma.client';
import { appCache, cacheKeys } from '../../shared/utils/cache';

export class DashboardService {
  private getDefaultSummary() {
    return {
      stats: {
        totalCreditors: 0,
        activeLoans: 0,
        totalReleased: 0,
        totalCollections: 0,
        totalPayables: 0,
        profit: 0,
        overdueLoans: 0,
        dueTodayLoans: 0,
      },
      collections: {
        dueToday: {
          count: 0,
          totalAmount: 0,
        },
        dueThisWeek: {
          count: 0,
          totalAmount: 0,
        },
        overdue: {
          count: 0,
          totalAmount: 0,
        },
      },
      loanDistribution: {} as Record<string, number>,
      recentActivities: [] as Array<{
        type: string;
        description: string;
        creditorName: string;
        timestamp: Date;
      }>,
      unavailable: true,
    };
  }

  async getSummary(userId: string) {
    const cacheKey = cacheKeys.dashboardSummary(userId);
    const cached = appCache.get<unknown>(cacheKey);
    if (cached) {
      return cached;
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const tomorrow = new Date(startOfToday);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(startOfToday);
    nextWeek.setDate(nextWeek.getDate() + 7);

    try {
      // Batch summary reads into a single Prisma transaction to reduce pool pressure.
      const [
        totalCreditors,
        activeLoans,
        totalReleased,
        totalCollections,
        totalPayables,
        overdueLoans,
        dueTodayLoans,
        dueTodayAmount,
        dueThisWeekAmount,
        overdueAmount,
        recentActivities,
        loanDistribution,
      ] = await prisma.$transaction([
      // Total creditors (not archived)
      prisma.creditor.count({
        where: { userId, deletedAt: null, status: 'active' },
      }),

      // Active loans count
      prisma.loan.count({
        where: {
          userId,
          deletedAt: null,
          OR: [
            {
              status: {
                equals: 'active',
                mode: 'insensitive',
              },
            },
            {
              status: {
                equals: 'overdue',
                mode: 'insensitive',
              },
            },
          ],
        },
      }),

      // Total released amount (sum of all principal)
      prisma.loan.aggregate({
        where: { userId, deletedAt: null },
        _sum: { principal: true },
      }),

      // Total collections (sum of all paid amounts)
      prisma.loan.aggregate({
        where: { userId, deletedAt: null },
        _sum: { paidAmount: true },
      }),

      // Total payables (remaining balance)
      prisma.loan.aggregate({
        where: { userId, deletedAt: null, remainingBalance: { gt: 0 } },
        _sum: { remainingBalance: true },
      }),

      // Overdue loans count
      prisma.loan.count({
        where: {
          userId,
          deletedAt: null,
          status: {
            equals: 'overdue',
            mode: 'insensitive',
          },
          remainingBalance: { gt: 0 },
        },
      }),

      // Due today count
      prisma.loan.count({
        where: {
          userId,
          deletedAt: null,
          dueDate: {
            gte: startOfToday,
            lt: endOfToday,
          },
          remainingBalance: { gt: 0 },
        },
      }),

      // Due today amount
      prisma.loan.aggregate({
        where: {
          userId,
          deletedAt: null,
          dueDate: {
            gte: startOfToday,
            lt: endOfToday,
          },
          remainingBalance: { gt: 0 },
        },
        _sum: { remainingBalance: true },
      }),

      // Due this week amount
      prisma.loan.aggregate({
        where: {
          userId,
          deletedAt: null,
          dueDate: {
            gte: startOfToday,
            lt: nextWeek,
          },
          remainingBalance: { gt: 0 },
        },
        _sum: { remainingBalance: true },
      }),

      // Overdue amount
      prisma.loan.aggregate({
        where: {
          userId,
          deletedAt: null,
          dueDate: { lt: startOfToday },
          remainingBalance: { gt: 0 },
        },
        _sum: { remainingBalance: true },
      }),

      // Recent activities (last 5 payments)
      prisma.payment.findMany({
        where: { userId, deletedAt: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          amount: true,
          createdAt: true,
          loan: {
            select: {
              loanNumber: true,
              creditor: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),

      // Loan status distribution
      prisma.loan.groupBy({
        by: ['status'],
        where: { userId, deletedAt: null },
        _count: { _all: true },
      }),
      ]);

      const totalPaid = Number(totalCollections._sum.paidAmount || 0);
      const totalReleaseAmount = Number(totalReleased._sum.principal || 0);
      const profit = totalPaid - totalReleaseAmount;

      const summary = {
        stats: {
          totalCreditors,
          activeLoans,
          totalReleased: totalReleaseAmount,
          totalCollections: totalPaid,
          totalPayables: Number(totalPayables._sum.remainingBalance || 0),
          profit,
          overdueLoans,
          dueTodayLoans,
        },
        collections: {
          dueToday: {
            count: dueTodayLoans,
            totalAmount: Number(dueTodayAmount._sum.remainingBalance || 0),
          },
          dueThisWeek: {
            count: 0, // Will be calculated from due this week minus due today
            totalAmount:
              Number(dueThisWeekAmount._sum.remainingBalance || 0) -
              Number(dueTodayAmount._sum.remainingBalance || 0),
          },
          overdue: {
            count: overdueLoans,
            totalAmount: Number(overdueAmount._sum.remainingBalance || 0),
          },
        },
        loanDistribution: loanDistribution.reduce(
          (acc, item) => {
            acc[item.status] = item._count._all;
            return acc;
          },
          {} as Record<string, number>
        ),
        recentActivities: recentActivities.map((payment) => ({
          type: 'Payment',
          description: `Payment of ${payment.amount} for loan ${payment.loan.loanNumber}`,
          creditorName: `${payment.loan.creditor.firstName} ${payment.loan.creditor.lastName}`,
          timestamp: payment.createdAt,
        })),
      };

      appCache.set(cacheKey, summary, 3 * 60 * 1000); // 3 minutes cache
      return summary;
    } catch (error) {
      console.error('[DashboardService] Failed to fetch dashboard summary', error);

      if (cached) {
        return cached;
      }

      return this.getDefaultSummary();
    }
  }
}

export const dashboardService = new DashboardService();
