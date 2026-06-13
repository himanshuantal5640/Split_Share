import fs from 'fs/promises';
import path from 'path';
import prisma from '../config/database.js';
import env from '../config/env.js';

/**
 * Checks system readiness.
 * Verifies: Database, Env Vars, Uploads folder writable.
 */
export const getReadiness = async () => {
  const checks = {
    database: { status: 'DOWN', error: null },
    environment: { status: 'INCOMPLETE', missing: [] },
    uploadsFolder: { status: 'FAILED', path: null, error: null }
  };

  let overallReady = true;

  // 1. Verify Database Connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = 'UP';
  } catch (err) {
    checks.database.status = 'DOWN';
    checks.database.error = err.message || err.toString();
    overallReady = false;
  }

  // 2. Verify Environment Variables
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missing.length === 0) {
    checks.environment.status = 'COMPLETE';
  } else {
    checks.environment.status = 'INCOMPLETE';
    checks.environment.missing = missing;
    overallReady = false;
  }

  // 3. Verify Uploads Folder existence and writability
  const uploadsPath = path.resolve('uploads');
  checks.uploadsFolder.path = uploadsPath;
  try {
    // Attempt to access or create directory
    try {
      await fs.access(uploadsPath);
    } catch {
      await fs.mkdir(uploadsPath, { recursive: true });
    }

    // Try reading/writing a temp file to verify permissions
    const testFile = path.join(uploadsPath, `.readiness-test-${Date.now()}`);
    await fs.writeFile(testFile, 'ok');
    await fs.readFile(testFile, 'utf8');
    await fs.unlink(testFile);

    checks.uploadsFolder.status = 'WRITABLE';
  } catch (err) {
    checks.uploadsFolder.status = 'FAILED';
    checks.uploadsFolder.error = err.message || err.toString();
    overallReady = false;
  }

  return {
    ready: overallReady,
    timestamp: new Date(),
    checks
  };
};

/**
 * Checks system component health metrics.
 */
export const getHealth = async () => {
  const status = {
    database: { status: 'DOWN', latencyMs: null },
    importEngine: { status: 'UNKNOWN', totalJobsCount: 0, stuckJobsCount: 0 },
    balanceEngine: { status: 'UNKNOWN', activeMembershipsCount: 0 },
    currencyEngine: { status: 'UNKNOWN', exchangeRatesCount: 0 }
  };

  // 1. Check Database UP/DOWN & Latency
  const startDb = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database.status = 'UP';
    status.database.latencyMs = Date.now() - startDb;
  } catch (err) {
    status.database.status = 'DOWN';
  }

  // 2. Check Import Engine status (stuck jobs)
  try {
    const totalJobs = await prisma.import.count();
    
    // Stuck jobs are those in PROCESSING status for more than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const stuckJobs = await prisma.import.count({
      where: {
        status: 'PROCESSING',
        updatedAt: {
          lt: thirtyMinutesAgo
        }
      }
    });

    status.importEngine.status = 'HEALTHY';
    status.importEngine.totalJobsCount = totalJobs;
    status.importEngine.stuckJobsCount = stuckJobs;

    if (stuckJobs > 0) {
      status.importEngine.status = 'DEGRADED';
    }
  } catch (err) {
    status.importEngine.status = 'DOWN';
  }

  // 3. Check Balance Engine status (check memberships)
  try {
    const activeMembersCount = await prisma.groupMembership.count({
      where: { status: 'ACTIVE' }
    });

    status.balanceEngine.status = 'HEALTHY';
    status.balanceEngine.activeMembershipsCount = activeMembersCount;
  } catch (err) {
    status.balanceEngine.status = 'DOWN';
  }

  // 4. Check Currency Engine status (registered exchange rates)
  try {
    const ratesCount = await prisma.exchangeRate.count();

    status.currencyEngine.status = 'HEALTHY';
    status.currencyEngine.exchangeRatesCount = ratesCount;
  } catch (err) {
    status.currencyEngine.status = 'DOWN';
  }

  const overallHealthy = Object.values(status).every(engine => engine.status === 'HEALTHY' || engine.status === 'UP');

  return {
    healthy: overallHealthy,
    timestamp: new Date(),
    status
  };
};

export default {
  getReadiness,
  getHealth
};
