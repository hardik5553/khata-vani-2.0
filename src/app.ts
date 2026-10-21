import 'dotenv/config';
import express, { Application, json } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { requestIdMiddleware } from './middleware/request-id';
import { errorHandler, notFound } from './middleware/error-handler';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { ProductService } from './services/product.service';
import { TransactionService } from './services/transaction.service';
import { ReorderService } from './services/reorder.service';
import { ReportService } from './services/report.service';
import { BackupService } from './services/backup.service';
import { HealthController } from './controllers/health.controller';
import { ProductController } from './controllers/product.controller';
import { TransactionController } from './controllers/transaction.controller';
import { ReorderController } from './controllers/reorder.controller';
import { ReportController } from './controllers/reorder.controller';
import { BackupController } from './controllers/reorder.controller';
import { NemotronController } from './controllers/reorder.controller';
import { NemotronService } from './ai/nemotron-provider';

import healthRoutes from './routes/health.routes';
import { router as productsRouter, setProductController } from './routes/products.routes';
import { router as transactionsRouter, setTransactionController } from './routes/transactions.routes';
import { router as reorderRouter, setReorderController } from './routes/reorder.routes';
import { router as reportsRouter, setReportController, setBackupController, setNemotronController } from './routes/reports.routes';

// Initialize services
const productService = new ProductService(prisma);
const transactionService = new TransactionService(prisma);
const reorderService = new ReorderService(prisma);
const reportService = new ReportService(prisma);
const backupService = new BackupService(prisma);
const nemotronService = new NemotronService();

// Initialize controllers
const healthController = new HealthController();
const productController = new ProductController(productService);
const transactionController = new TransactionController(transactionService);
const reorderController = new ReorderController(reorderService);
const reportController = new ReportController(reportService);
const backupController = new BackupController(backupService);
const nemotronController = new NemotronController();

// Wire controllers to routes
setProductController(productController);
setTransactionController(transactionController);
setReorderController(reorderController);
setReportController(reportController);
setBackupController(backupController);
setNemotronController(nemotronController);

export function createApp(): Application {
  const app = express();

  // Request ID for diagnostics
  app.use(requestIdMiddleware);

  // CORS - allows all for demo and LAN mobile access
  app.use(cors({ origin: env.CORS_ORIGIN || '*' }));

  // Body parsing
  app.use(json({ limit: '10mb' }));

  // Serve static assets for the frontend
  const publicDir = path.join(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // Health route (for load balancers & ping)
  app.use('/health', healthRoutes);

  // API routes
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/products', productsRouter);
  app.use('/api/v1/transactions', transactionsRouter);
  app.use('/api/v1/reorder-suggestions', reorderRouter);
  app.use('/api/v1/reports', reportsRouter);

  // SPA fallback: Serve frontend index.html for navigation routes
  app.get(['/', '/dashboard', '/inventory', '/sales', '/stock-in', '/reorder', '/reports', '/settings', '/voice', '/camera'], (req, res, next) => {
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });

  // 404 handler for unmatched API routes
  app.use(notFound);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

export { prisma };
