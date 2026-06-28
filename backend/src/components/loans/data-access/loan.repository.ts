import { prisma } from '../../../shared/utils/prisma.client';

export class LoanRepository {
  async findAll(userId: string, page = 1, limit = 10, search?: string, status?: string, creditorId?: string, includeTotal = false) {
    const skip = (page - 1) * limit;
    const where: any = { userId, deletedAt: null };

    if (status && status !== 'all') {
      where.status = {
        equals: status,
        mode: 'insensitive',
      };
    }

    if (creditorId && creditorId !== 'all') {
      where.creditorId = creditorId;
    }

    if (search) {
      const borrowerNameTerms = search
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      where.OR = [
        { loanNumber: { contains: search, mode: 'insensitive' } },
        { creditor: { firstName: { contains: search, mode: 'insensitive' } } },
        { creditor: { middleName: { contains: search, mode: 'insensitive' } } },
        { creditor: { lastName: { contains: search, mode: 'insensitive' } } },
        ...(borrowerNameTerms.length > 1
          ? [
              {
                AND: borrowerNameTerms.map((term) => ({
                  OR: [
                    { creditor: { firstName: { contains: term, mode: 'insensitive' } } },
                    { creditor: { middleName: { contains: term, mode: 'insensitive' } } },
                    { creditor: { lastName: { contains: term, mode: 'insensitive' } } },
                  ],
                })),
              },
            ]
          : []),
      ];
    }

    if (includeTotal) {
      const [loans, total] = await Promise.all([
        prisma.loan.findMany({
          where,
          skip,
          take: limit,
          include: {
            creditor: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.loan.count({ where }),
      ]);

      return { loans, total, hasMore: skip + loans.length < total };
    }

    const loans = await prisma.loan.findMany({
      where,
      skip,
      take: limit + 1,
      include: {
        creditor: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = loans.length > limit;
    return {
      loans: hasMore ? loans.slice(0, limit) : loans,
      total: null,
      hasMore,
    };
  }

  async findById(id: string, userId: string) {
    return prisma.loan.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        creditor: true,
        payments: {
          where: { deletedAt: null },
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  }

  async findByLoanNumber(loanNumber: string) {
    return prisma.loan.findUnique({
      where: { loanNumber },
    });
  }

  async getNextLoanSequence(userId: string): Promise<number> {
    // Get all loan numbers for this user (including deleted ones)
    // This prevents reusing loan numbers from deleted loans
    const loans = await prisma.loan.findMany({
      where: { userId },
      select: { loanNumber: true },
    });

    if (!loans.length) {
      return 1;
    }

    let maxSequence = 0;

    for (const loan of loans) {
      // Extract the last number segment (the actual sequence)
      // This handles: LOAN-001, LOAN-002, etc.
      const match = loan.loanNumber.match(/-(\d+)$/);
      if (!match?.[1]) continue;
      
      const sequence = parseInt(match[1], 10);
      if (Number.isFinite(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    }

    return maxSequence + 1;
  }

  async create(userId: string, data: any) {
    return prisma.loan.create({
      data: {
        ...data,
        userId,
      },
      include: {
        creditor: true,
      },
    });
  }

  async update(id: string, userId: string, data: any) {
    return prisma.loan.updateMany({
      where: { id, userId, deletedAt: null },
      data,
    });
  }

  async softDelete(id: string, userId: string) {
    return prisma.loan.updateMany({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  async findOverdueLoan(dueDate: Date) {
    return prisma.loan.findMany({
      where: {
        dueDate: { lt: dueDate },
        remainingBalance: { gt: 0 },
        deletedAt: null,
      },
      include: { creditor: true },
    });
  }
}

export const loanRepository = new LoanRepository();
