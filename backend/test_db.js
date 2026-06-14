import { PrismaClient } from '@prisma/client';

console.log('Testing DATABASE_URL from env:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Trying to connect...');
    await prisma.$connect();
    console.log('✅ Success! Connected to database.');
    const usersCount = await prisma.user.count();
    console.log('Total users in database:', usersCount);
  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
