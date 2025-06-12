import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectToDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MySQL via Prisma');
  } catch (err: any) {
    console.error('❌ MySQL connection error:', err.message);
    process.exit(1);
  }
};

export { prisma };
export default connectToDB;
