import { prisma } from './src/shared/utils/prisma.client';

async function main() {
  try {
    const deleted = await prisma.loan.deleteMany({});
    console.log(`Deleted ${deleted.count} loans`);
  } catch (error) {
    console.error('Error deleting loans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
