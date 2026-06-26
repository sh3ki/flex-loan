import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import 'dotenv/config';

import authRoutes from './components/auth/entry-points/auth.routes';
import creditorRoutes from './components/creditors/entry-points/creditor.routes';
import loanRoutes from './components/loans/entry-points/loan.routes';
import paymentRoutes from './components/payments/entry-points/payment.routes';
import dashboardRoutes from './components/dashboard/dashboard.routes';
import collectionsRoutes from './components/collections/collections.routes';
import settingsRoutes from './components/settings/settings.routes';
import notificationRoutes from './components/notifications/entry-points/notification.routes';
import { errorHandler } from './shared/middleware/error.middleware';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/creditors', creditorRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve frontend static files (for production/monorepo)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all route for SPA - Express 5 requires named wildcard params
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
