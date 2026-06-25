import { prisma } from '../../../shared/utils/prisma.client';

export class PaymentRepository {
  async findAll(userId: string, page = 1, limit = 10, search?: string, loanId?: string, creditorId?: string, includeTotal = false) {
    const skip = (page - 1) * limit;
    const where: any = { userId, deletedAt: null };

    if (loanId && loanId !== 'all') {
      where.loanId = loanId;
    }

    if (creditorId && creditorId !== 'all') {
      where.loan = {
        creditorId: creditorId,
      };
    }

    if (search) {
      where.OR = [
        { paymentNumber: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { loan: { loanNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (includeTotal) {
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          include: {
            loan: {
              select: {
                id: true,
                loanNumber: true,
                creditor: { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where }),
      ]);

      return { payments, total, hasMore: skip + payments.length < total };
    }

    const payments = await prisma.payment.findMany({
      where,
      skip,
      take: limit + 1,
      include: {
        loan: {
          select: {
            id: true,
            loanNumber: true,
            creditor: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = payments.length > limit;
    return {
      payments: hasMore ? payments.slice(0, limit) : payments,
      total: null,
      hasMore,
    };
  }

  async findById(id: string, userId: string) {
    return prisma.payment.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        loan: true,
      },
    });
  }

  async getNextPaymentSequence(loanId: string): Promise<number> {
    const lastPayment = await prisma.payment.findFirst({
      where: { loanId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastPayment) {
      return 1;
    }

    // Extract sequence number from paymentNumber (format: PAY-001-001)
    const match = lastPayment.paymentNumber.match(/PAY-\d+-(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10) + 1;
    }

    return 1;
  }

  async create(userId: string, data: any) {
    return prisma.payment.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    return prisma.payment.updateMany({
      where: { id, userId, deletedAt: null },
      data,
    });
  }

  async softDelete(id: string, userId: string) {
    return prisma.payment.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }
}

export const paymentRepository = new PaymentRepository();
