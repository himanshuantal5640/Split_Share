import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { createPool } from 'mariadb';
import env from './env.js';

// The mariadb Node.js client requires the 'mariadb://' protocol scheme.
// We translate 'mysql://' to 'mariadb://' automatically to keep env config simple.
const databaseUri = env.databaseUrl.replace(/^mysql:/i, 'mariadb:');

// Create a MariaDB pool
const pool = createPool(databaseUri);
const adapter = new PrismaMariaDb(pool);

// Instantiate PrismaClient with the driver adapter
const prisma = new PrismaClient({
  adapter,
  log: env.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error', 'warn']
});

// Test connection helper
export const connectDb = async () => {
  try {
    // Try to obtain a connection to verify database credentials and state
    const conn = await pool.getConnection();
    conn.release();
    console.log('🔌 Database connected successfully (MySQL/MariaDB via Driver Adapter).');
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
