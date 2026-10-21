import { PrismaClient } from '@prisma/client';
import { ProductRepository } from '../repositories/product.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { HttpError } from '../middleware/error-handler';

// Decimal-safe helpers for SQLite (Prisma Decimal maps to TEXT in SQLite)
function toNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  try {
    return parseFloat(String(val)) || 0;
  } catch {
    return 0;
  }
}

export class TransactionService {
  private productRepo: ProductRepository;
  private txRepo: TransactionRepository;

  constructor(prisma: PrismaClient) {
    this.productRepo = new ProductRepository(prisma);
    this.txRepo = new TransactionRepository(prisma);
  }

  /**
   * Record a sale atomically: validate stock, decrement product quantity,
   * and create a sale transaction. All in one database transaction.
   */
  async recordSale(data: {
    productId: string;
    quantity: number;
    soldPrice?: number | null;
    timestamp?: string;
    note?: string | null;
  }) {
    if (data.quantity <= 0) {
      throw new HttpError('Sale quantity must be greater than 0', 400, 'INVALID_QUANTITY');
    }

    return this.productRepo.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) {
        throw new HttpError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      const currentStock = toNumber(product.quantity);
      if (currentStock < data.quantity) {
        throw new HttpError('Not enough stock available', 409, 'INSUFFICIENT_STOCK', {
          available: currentStock,
          requested: data.quantity,
        });
      }

      const soldPrice = data.soldPrice != null ? data.soldPrice : toNumber(product.sellingPrice);

      // Decrement stock and create transaction atomically
      const [updatedProduct, transaction] = await Promise.all([
        tx.product.update({
          where: { id: data.productId },
          data: { quantity: { decrement: data.quantity } },
        }),
        tx.transaction.create({
          data: {
            productId: data.productId,
            type: 'sale',
            quantity: data.quantity,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            unitPrice: soldPrice,
            note: data.note ?? null,
          },
          include: { product: true },
        }),
      ]);

      return {
        transaction: {
          id: transaction.id,
          type: transaction.type,
          quantity: toNumber(transaction.quantity),
          timestamp: transaction.timestamp.toISOString(),
          unitPrice: transaction.unitPrice != null ? toNumber(transaction.unitPrice) : null,
          note: transaction.note,
        },
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          quantity: toNumber(updatedProduct.quantity),
          unit: updatedProduct.unit,
        },
      };
    });
  }

  /**
   * Record stock-in atomically: increment product quantity and create transaction.
   */
  async recordStockIn(data: {
    productId: string;
    quantity: number;
    unitCost?: number | null;
    supplier?: string | null;
    timestamp?: string;
    note?: string | null;
  }) {
    if (data.quantity <= 0) {
      throw new HttpError('Stock-in quantity must be greater than 0', 400, 'INVALID_QUANTITY');
    }

    return this.productRepo.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) {
        throw new HttpError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      const [updatedProduct, transaction] = await Promise.all([
        tx.product.update({
          where: { id: data.productId },
          data: { quantity: { increment: data.quantity } },
        }),
        tx.transaction.create({
          data: {
            productId: data.productId,
            type: 'stock-in',
            quantity: data.quantity,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            unitPrice: data.unitCost != null ? data.unitCost : null,
            note: data.note ? `Supplier: ${data.supplier ?? ''}. ${data.note}` : data.supplier ?? null,
          },
          include: { product: true },
        }),
      ]);

      return {
        transaction: {
          id: transaction.id,
          type: transaction.type,
          quantity: toNumber(transaction.quantity),
          timestamp: transaction.timestamp.toISOString(),
          unitPrice: transaction.unitPrice != null ? toNumber(transaction.unitPrice) : null,
          note: transaction.note,
        },
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          quantity: toNumber(updatedProduct.quantity),
          unit: updatedProduct.unit,
        },
      };
    });
  }

  /**
   * Record an adjustment (positive or negative delta) with audit trail.
   * Rejects negative resulting stock unless explicitly allowed.
   */
  async recordAdjustment(data: {
    productId: string;
    delta: number;
    reason: string;
    timestamp?: string;
    note?: string | null;
  }) {
    if (data.delta === 0) {
      throw new HttpError('Adjustment delta must not be zero', 400, 'INVALID_DELTA');
    }

    return this.productRepo.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: data.productId } });
      if (!product) {
        throw new HttpError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      const currentStock = toNumber(product.quantity);
      const newStock = currentStock + data.delta;

      // Reject negative resulting stock
      if (newStock < 0) {
        throw new HttpError('Adjustment would result in negative stock', 409, 'NEGATIVE_STOCK', {
          available: currentStock,
          requestedDelta: data.delta,
          resultingStock: newStock,
        });
      }

      const [updatedProduct, transaction] = await Promise.all([
        tx.product.update({
          where: { id: data.productId },
          data: { quantity: { increment: data.delta } },
        }),
        tx.transaction.create({
          data: {
            productId: data.productId,
            type: 'adjustment',
            quantity: Math.abs(data.delta),
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            note: `${data.reason}${data.note ? ` | ${data.note}` : ''}`,
          },
          include: { product: true },
        }),
      ]);

      return {
        transaction: {
          id: transaction.id,
          type: transaction.type,
          quantity: toNumber(transaction.quantity),
          timestamp: transaction.timestamp.toISOString(),
          note: transaction.note,
        },
        product: {
          id: updatedProduct.id,
          name: updatedProduct.name,
          quantity: toNumber(updatedProduct.quantity),
          unit: updatedProduct.unit,
        },
      };
    });
  }

  async getTransactionHistory({ from, to, type, productId, page, limit }: {
    from?: Date;
    to?: Date;
    type?: string;
    productId?: string;
    page: number;
    limit: number;
  }) {
    const result = await this.txRepo.findAll({ from, to, type, productId, page, limit });
    return {
      transactions: result.transactions.map((t: any) => ({
        id: t.id,
        productId: t.productId,
        productName: t.product?.name,
        productUnit: t.product?.unit,
        type: t.type,
        quantity: toNumber(t.quantity),
        timestamp: t.timestamp.toISOString(),
        unitPrice: t.unitPrice != null ? toNumber(t.unitPrice) : null,
        note: t.note,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}