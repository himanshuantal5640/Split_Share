import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

// Check for required environment variables
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar}`);
  });
  process.exit(1);
}

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

export default env;
