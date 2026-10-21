import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';
import {
  recordSaleSchema,
  recordStockInSchema,
  recordAdjustmentSchema,
  transactionHistoryQuerySchema,
} from '../schemas';
import { HttpError } from '../middleware/error-handler';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  async recordSale(req: Request, res: Response): Promise<void> {
    const parsed = recordSaleSchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const result = await this.transactionService.recordSale(parsed.data.body);
    res.status(201).json(result);
  }

  async recordStockIn(req: Request, res: Response): Promise<void> {
    const parsed = recordStockInSchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const result = await this.transactionService.recordStockIn(parsed.data.body);
    res.status(201).json(result);
  }

  async recordAdjustment(req: Request, res: Response): Promise<void> {
    const parsed = recordAdjustmentSchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const result = await this.transactionService.recordAdjustment(parsed.data.body);
    res.status(201).json(result);
  }

  async history(req: Request, res: Response): Promise<void> {
    const parsed = transactionHistoryQuerySchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const { from, to, type, productId, page, limit } = parsed.data.query;
    const result = await this.transactionService.getTransactionHistory({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      type,
      productId,
      page,
      limit,
    });
    res.json(result);
  }
}
