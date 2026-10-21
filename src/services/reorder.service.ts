import { PrismaClient } from '@prisma/client';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ProductRepository } from '../repositories/product.repository';

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

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  unit: string;
  reorderPoint: number;
  averageDailySales: number;
  leadTimeDays: number;
  safetyStock: number;
  suggestedOrderQty: number;
  reason: string;
  dataConfidence: 'high' | 'medium' | 'low';
  fallbackUsed: boolean;
}

export class ReorderService {
  private txRepo: TransactionRepository;
  private productRepo: ProductRepository;

  constructor(prisma: PrismaClient) {
    this.txRepo = new TransactionRepository(prisma);
    this.productRepo = new ProductRepository(prisma);
  }

  async getSuggestions({
    lookbackDays = 30,
    leadTimeDays = 7,
    safetyStock = 0,
  }: { lookbackDays?: number; leadTimeDays?: number; safetyStock?: number }) {
    const products = await this.productRepo.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        quantity: true,
        reorderThreshold: true,
        unit: true,
      },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const from = new Date(now);
    from.setDate(now.getDate() - lookbackDays);

    const sales = await this.txRepo.getSalesByPeriod(from, now);

    // Group sales by product and day
    const salesByProduct: Record<string, { date: string; qty: number }[]> = {};
    for (const sale of sales) {
      const dateStr = sale.timestamp.toISOString().split('T')[0];
      if (!salesByProduct[sale.productId]) salesByProduct[sale.productId] = [];
      salesByProduct[sale.productId].push({ date: dateStr, qty: toNumber(sale.quantity) });
    }

    const suggestions: ReorderSuggestion[] = [];

    for (const p of products) {
      const currentStock = toNumber(p.quantity);
      const threshold = toNumber(p.reorderThreshold);
      const productSales = salesByProduct[p.id] || [];

      // Calculate average daily sales over the lookback window
      const totalQtySold = productSales.reduce((sum, s) => sum + s.qty, 0);
      const uniqueDays = new Set(productSales.map((s) => s.date)).size;
      const effectiveDays = Math.max(uniqueDays, 1);
      const averageDailySales = totalQtySold / lookbackDays;

      let fallbackUsed = false;
      let dataConfidence: 'high' | 'medium' | 'low' = 'low';

      if (uniqueDays >= Math.ceil(lookbackDays / 2)) {
        dataConfidence = 'high';
      } else if (uniqueDays >= 1) {
        dataConfidence = 'medium';
      }

      let reorderPoint: number;
      let reason: string;

      if (uniqueDays >= Math.ceil(lookbackDays / 2)) {
        // Reorder point = average daily sales × lead time + safety stock
        reorderPoint = averageDailySales * leadTimeDays + safetyStock;
        fallbackUsed = false;
        reason = `Based on ${totalQtySold} units sold over ${lookbackDays} days (avg ${averageDailySales.toFixed(2)}/day). Reorder point = ${averageDailySales.toFixed(2)} × ${leadTimeDays} days + ${safetyStock} safety stock.`;
      } else {
        // Fallback to user-set threshold
        reorderPoint = threshold;
        fallbackUsed = true;
        dataConfidence = 'low';
        reason = `Insufficient sales history (${uniqueDays} days with data). Falling back to user-set reorder threshold of ${threshold}.`;
      }

      const needsReorder = currentStock <= reorderPoint;
      const suggestedOrderQty = needsReorder ? Math.max(reorderPoint - currentStock, 0) : 0;

      suggestions.push({
        productId: p.id,
        productName: p.name,
        currentStock,
        unit: p.unit,
        reorderPoint,
        averageDailySales: Math.round(averageDailySales * 100) / 100,
        leadTimeDays,
        safetyStock,
        suggestedOrderQty,
        reason,
        dataConfidence,
        fallbackUsed,
      });
    }

    // Sort: items needing reorder first, then by low stock
    suggestions.sort((a, b) => {
      const aNeeds = a.currentStock <= a.reorderPoint;
      const bNeeds = b.currentStock <= b.reorderPoint;
      if (aNeeds && !bNeeds) return -1;
      if (!aNeeds && bNeeds) return 1;
      return a.currentStock - b.currentStock;
    });

    return suggestions;
  }
}