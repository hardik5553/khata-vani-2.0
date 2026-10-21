import { PrismaClient } from '@prisma/client';
import { TransactionRepository } from '../repositories/transaction.repository';

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

export interface ReportSummary {
  period: { from: string; to: string };
  totalProducts: number;
  lowStockCount: number;
  totalSales: number;
  totalSalesCount: number;
  estimatedStockValue: number;
  estimatedGrossMargin: number;
  costDataAvailable: boolean;
  fastMovingProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    unit: string;
  }>;
  dailySales: Array<{ date: string; sales: number; count: number }>;
  note: string;
}

export class ReportService {
  private txRepo: TransactionRepository;

  constructor(prisma: PrismaClient) {
    this.txRepo = new TransactionRepository(prisma);
  }

  async getSummary({ from, to }: { from?: Date; to?: Date }): Promise<ReportSummary> {
    const now = new Date();
    const endDate = to ?? now;
    const startDate = from ?? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6); // default 7 days

    // Get all products for stock value and low stock count
    const products = await this.txRepo.getAllProducts();
    const lowStockCount = products.filter((p) => toNumber(p.quantity) <= toNumber(p.reorderThreshold)).length;

    // Get all transactions in period
    const transactions = await this.txRepo.getTransactionsByPeriod(startDate, endDate);
    const sales = transactions.filter((t) => t.type === 'sale');

    let totalSales = 0;
    let totalSalesCount = 0;
    let estimatedGrossMargin = 0;
    let costDataAvailable = false;
    const salesByDay: Record<string, { sales: number; count: number }> = {};
    const salesByProduct: Record<string, { name: string; unit: string; qty: number }> = {};

    for (const sale of sales) {
      const qty = toNumber(sale.quantity);
      const dateStr = sale.timestamp.toISOString().split('T')[0];

      totalSales += qty;
      totalSalesCount += 1;

      if (!salesByDay[dateStr]) salesByDay[dateStr] = { sales: 0, count: 0 };
      salesByDay[dateStr].sales += qty;
      salesByDay[dateStr].count += 1;

      if (sale.product) {
        if (!salesByProduct[sale.product.id]) {
          salesByProduct[sale.product.id] = { name: sale.product.name, unit: sale.product.unit, qty: 0 };
        }
        salesByProduct[sale.product.id].qty += qty;

        // Gross margin estimation
        const sellingPrice = toNumber(sale.unitPrice) || toNumber(sale.product.sellingPrice);
        const purchaseCost = toNumber(sale.product.purchaseCost);
        if (purchaseCost > 0) {
          costDataAvailable = true;
          estimatedGrossMargin += (sellingPrice - purchaseCost) * qty;
        }
      }
    }

    // Estimated stock value (quantity × selling price, or purchase cost if selling price missing)
    let estimatedStockValue = 0;
    for (const p of products) {
      const price = toNumber(p.sellingPrice) ?? toNumber(p.purchaseCost) ?? 0;
      estimatedStockValue += toNumber(p.quantity) * price;
    }

    const fastMovingProducts = Object.values(salesByProduct)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10)
      .map((p) => ({
        productId: '', // will be filled below
        productName: p.name,
        quantitySold: p.qty,
        unit: p.unit,
      }));

    // Fill product IDs
    const productMap = new Map(products.map((p) => [p.name, p.id]));
    for (const fm of fastMovingProducts) {
      fm.productId = productMap.get(fm.productName) ?? '';
    }

    const dailySales = Object.entries(salesByDay)
      .map(([date, data]) => ({ date, sales: data.sales, count: data.count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const hasCostData = costDataAvailable;
    const note = hasCostData
      ? 'Estimated gross margin calculated using available purchase cost data.'
      : 'Purchase cost data is missing for some or all products. Gross margin cannot be estimated accurately.';

    return {
      period: { from: startDate.toISOString().split('T')[0], to: endDate.toISOString().split('T')[0] },
      totalProducts: products.length,
      lowStockCount,
      totalSales,
      totalSalesCount,
      estimatedStockValue: Math.round(estimatedStockValue * 100) / 100,
      estimatedGrossMargin: Math.round(estimatedGrossMargin * 100) / 100,
      costDataAvailable: hasCostAvailable(products),
      fastMovingProducts,
      dailySales,
      note,
    };
  }
}

function hasCostAvailable(products: any[]): boolean {
  return products.some((p) => (p.purchaseCost != null && parseFloat(String(p.purchaseCost)) > 0));
}
