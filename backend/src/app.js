import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env.js';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import groupRouter from './routes/group.routes.js';
import expenseRouter from './routes/expense.routes.js';
import settlementRouter from './routes/settlement.routes.js';
import notFound from './middleware/notFound.middleware.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// HTTP request logger middleware
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/groups', groupRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/settlements', settlementRouter);


// Catch 404 and forward to error handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;
