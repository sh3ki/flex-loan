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
      const borrowerNameTerms = search
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      where.OR = [
        { paymentNumber: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { loan: { loanNumber: { contains: search, mode: 'insensitive' } } },
        { loan: { creditor: { firstName: { contains: search, mode: 'insensitive' } } } },
        { loan: { creditor: { middleName: { contains: search, mode: 'insensitive' } } } },
        { loan: { creditor: { lastName: { contains: search, mode: 'insensitive' } } } },
        ...(borrowerNameTerms.length > 1
          ? [
              {
                AND: borrowerNameTerms.map((term) => ({
                  OR: [
                    { loan: { creditor: { firstName: { contains: term, mode: 'insensitive' } } } },
                    { loan: { creditor: { middleName: { contains: term, mode: 'insensitive' } } } },
                    { loan: { creditor: { lastName: { contains: term, mode: 'insensitive' } } } },
                  ],
                })),
              },
            ]
          : []),
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
    // Include soft-deleted rows so we never reuse a globally unique payment number.
    const payments = await prisma.payment.findMany({
      where: { loanId },
      select: { paymentNumber: true },
    });

    let maxSequence = 0;
    for (const payment of payments) {
      const match = payment.paymentNumber.match(/^PAY-\d+-(\d+)$/i);
      if (!match?.[1]) continue;

      const sequence = parseInt(match[1], 10);
      if (Number.isFinite(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    }

    return maxSequence + 1;
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
