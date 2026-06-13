import { PrismaClient } from '@prisma/client';
import env from './env.js';

// Instantiate native PrismaClient
const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error', 'warn']
});

// Test connection helper
export const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log('🔌 Database connected successfully (MySQL via Prisma 6).');
  } catch (error) {
    console.error('❌ Database connection failure:', error.message);
    if (env.nodeEnv === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Proceeding without database connection (Development Mode).');
    }
  }
};

export default prisma;
