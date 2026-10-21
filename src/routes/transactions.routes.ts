import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { TransactionService } from '../services/transaction.service';
import { catchAsync } from '../middleware/async-handler';

let transactionController: TransactionController;

export function setTransactionController(controller: TransactionController): void {
  transactionController = controller;

  router.post('/sales', catchAsync(transactionController.recordSale.bind(transactionController)));
  router.post('/stock-in', catchAsync(transactionController.recordStockIn.bind(transactionController)));
  router.post('/adjustments', catchAsync(transactionController.recordAdjustment.bind(transactionController)));
  router.get('/', catchAsync(transactionController.history.bind(transactionController)));
}

const router = Router();

export { router };
export default router;
