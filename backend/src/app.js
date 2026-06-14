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
import importRouter from './routes/import.routes.js';
import anomalyRouter from './routes/anomaly.routes.js';
import resolutionRouter from './routes/resolution.routes.js';
import exchangeRateRouter from './routes/exchangeRate.routes.js';
import balanceRouter from './routes/balance.routes.js';
import debtRouter from './routes/debt.routes.js';
import importProcessorRouter from './routes/importProcessor.routes.js';
import reportRouter from './routes/report.routes.js';
import systemRouter from './routes/system.routes.js';
import notFound from './middleware/notFound.middleware.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-vercel-app.vercel.app" // Replace this with your actual Vercel/Netlify URL when deployed
  ],
  credentials: true
}));

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
app.use('/api', systemRouter);
app.use('/api/auth', authRouter);
app.use('/api/groups', groupRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/settlements', settlementRouter);
app.use('/api/imports', importRouter);
app.use('/api', resolutionRouter);
app.use('/api', anomalyRouter);
app.use('/api/exchange-rates', exchangeRateRouter);
app.use('/api/balances', balanceRouter);
app.use('/api', debtRouter);
app.use('/api', importProcessorRouter);
app.use('/api', reportRouter);


// Catch 404 and forward to error handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

export default app;
