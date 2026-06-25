import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: bcryptjs.hashSync('admin123', 10),
      role: 'admin',
    },
  });

  console.log('Created admin user:', adminUser.id);

  // Create sample creditors
  const creditor1 = await prisma.creditor.create({
    data: {
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      contactNumber: '09123456789',
      email: 'juan@example.com',
      address: '123 Main St, Manila',
      status: 'active',
      userId: adminUser.id,
    },
  });

  const creditor2 = await prisma.creditor.create({
    data: {
      firstName: 'Maria',
      lastName: 'Santos',
      contactNumber: '09987654321',
      email: 'maria@example.com',
      address: '456 Oak Ave, Makati',
      status: 'active',
      userId: adminUser.id,
    },
  });

  console.log('Created creditors:', creditor1.id, creditor2.id);

  // Create sample loans
  const releaseDate = new Date();
  const termDays = 30;
  const dueDate = new Date(releaseDate);
  dueDate.setDate(dueDate.getDate() + termDays);

  const loan1 = await prisma.loan.create({
    data: {
      loanNumber: `LOAN-${Date.now()}-001`,
      principal: 10000,
      interestPerDay: 1,
      termDays,
      releaseDate,
      dueDate,
      dailyInterest: 100,
      totalInterest: 3000,
      totalPayable: 13000,
      paidAmount: 0,
      remainingBalance: 13000,
      status: 'Active',
      creditorId: creditor1.id,
      userId: adminUser.id,
    },
  });

  const loan2 = await prisma.loan.create({
    data: {
      loanNumber: `LOAN-${Date.now()}-002`,
      principal: 5000,
      interestPerDay: 0.5,
      termDays: 15,
      releaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      dailyInterest: 25,
      totalInterest: 375,
      totalPayable: 5375,
      paidAmount: 2000,
      remainingBalance: 3375,
      status: 'Active',
      creditorId: creditor2.id,
      userId: adminUser.id,
    },
  });

  console.log('Created loans:', loan1.id, loan2.id);

  // Create sample payments
  const payment1 = await prisma.payment.create({
    data: {
      paymentNumber: `PAY-${Date.now()}-001`,
      amount: 2000,
      paymentDate: new Date(),
      paymentMethod: 'Cash',
      loanId: loan2.id,
      userId: adminUser.id,
    },
  });

  console.log('Created payment:', payment1.id);

  console.log('Seed completed successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
