import env from '../config/env.js';

const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m',  // Cyan
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[90m'  // Gray
};

const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, ...args) => {
    console.log(
      `${colors.info}[INFO]${colors.reset} [${getTimestamp()}] ${message}`,
      args.length ? args : ''
    );
  },
  warn: (message, ...args) => {
    console.warn(
      `${colors.warn}[WARN]${colors.reset} [${getTimestamp()}] ${message}`,
      args.length ? args : ''
    );
  },
  error: (message, error, ...args) => {
    console.error(
      `${colors.error}[ERROR]${colors.reset} [${getTimestamp()}] ${message}`,
      error ? `\nStack: ${error.stack || error}` : '',
      args.length ? args : ''
    );
  },
  debug: (message, ...args) => {
    if (env.nodeEnv === 'development') {
      console.log(
        `${colors.debug}[DEBUG]${colors.reset} [${getTimestamp()}] ${message}`,
        args.length ? args : ''
      );
    }
  }
};

export default logger;
