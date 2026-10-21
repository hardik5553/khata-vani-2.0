import { PrismaClient } from '@prisma/client';
import { ProductRepository } from '../repositories/product.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { HttpError } from '../middleware/error-handler';

// Decimal-safe helpers for SQLite (Prisma Decimal maps to TEXT in SQLite)
// Prisma Decimal values can be converted to string then parsed back to number
function toNumber(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val) || 0;
  // Handle Prisma Decimal-like objects (have toString or valueOf)
  if (val instanceof Object) {
    const s = String(val);
    return parseFloat(s) || 0;
  }
  return 0;
}

function toDecimal(val: number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  return typeof val === 'number' ? val : parseFloat(String(val)) || 0;
}

export class ProductService {
  private productRepo: ProductRepository;
  private txRepo: TransactionRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.productRepo = new ProductRepository(prisma);
    this.txRepo = new TransactionRepository(prisma);
  }

  async listProducts({ search, lowStock, page, limit }: { search?: string; lowStock?: boolean; page: number; limit: number }) {
    const result = await this.productRepo.findAll({ lowStock: false, page, limit });

    // Apply case-insensitive search in-memory (SQLite/Prisma does not support 'mode: insensitive')
    let products = result.products;
    if (search) {
      const s = search.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(s));
    }

    // For lowStock flag, filter in-memory since SQLite/Prisma cross-field comparison is limited
    if (lowStock) {
      products = products.filter((p) => toNumber(p.quantity) <= toNumber(p.reorderThreshold));
    }

    // Adjust total to reflect filtered count
    const total = products.length;

    return {
      products: products.map((p) => this.formatProduct(p)),
      total,
      page: result.page,
      limit: result.limit,
    };
  }

  async getProduct(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new HttpError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    return this.formatProductWithTransactions(product);
  }

  async createProduct(data: {
    name: string;
    category?: string | null;
    unit: string;
    quantity: number;
    reorderThreshold: number;
    purchaseCost?: number | null;
    sellingPrice?: number | null;
    supplierId?: string | null;
    expiryDate?: string | null;
  }) {
    // Validate no negative values
    if (data.quantity < 0) {
      throw new HttpError('Quantity must be non-negative', 400, 'INVALID_QUANTITY');
    }
    if (data.reorderThreshold < 0) {
      throw new HttpError('Reorder threshold must be non-negative', 400, 'INVALID_REORDER_THRESHOLD');
    }

    const product = await this.productRepo.create(data);
    return this.formatProduct(product);
  }

  async updateProduct(id: string, data: Partial<{
    name: string;
    category: string | null;
    unit: string;
    quantity: number;
    reorderThreshold: number;
    purchaseCost: number | null;
    sellingPrice: number | null;
    supplierId: string | null;
    expiryDate: string | null;
  }>) {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new HttpError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const product = await this.productRepo.update(id, data);
    return this.formatProduct(product);
  }

  async deleteProduct(id: string) {
    const existing = await this.productRepo.findById(id);
    if (!existing) {
      throw new HttpError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    await this.productRepo.delete(id);
    return { message: 'Product deleted successfully' };
  }

  private formatProduct(product: any) {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
      quantity: toNumber(product.quantity),
      reorderThreshold: toNumber(product.reorderThreshold),
      purchaseCost: product.purchaseCost != null ? toNumber(product.purchaseCost) : null,
      sellingPrice: product.sellingPrice != null ? toNumber(product.sellingPrice) : null,
      supplierId: product.supplierId,
      expiryDate: product.expiryDate ? product.expiryDate.toISOString() : null,
      lowStock: toNumber(product.quantity) <= toNumber(product.reorderThreshold),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  async reorderSuggestions({ lookbackDays, leadTimeDays, safetyStock }: {
    lookbackDays?: number;
    leadTimeDays?: number;
    safetyStock?: number;
  }) {
    const days = lookbackDays ?? 30;
    const leadDays = leadTimeDays ?? 7;
    const safety = safetyStock ?? 0;

    // Get sales history for the lookback period
    const from = new Date();
    from.setDate(from.getDate() - days);

    const sales = await this.prisma.transaction.findMany({
      where: {
        type: 'sale',
        timestamp: { gte: from },
      },
      include: { product: true },
    });

    // Aggregate sales by product
    const salesByProduct: Record<string, { totalQuantity: number; totalRevenue: number }> = {};

    sales.forEach((sale) => {
      const productId = sale.productId;
      if (!salesByProduct[productId]) {
        salesByProduct[productId] = { totalQuantity: 0, totalRevenue: 0 };
      }
      salesByProduct[productId].totalQuantity += sale.quantity.toNumber() || 0;
      salesByProduct[productId].totalRevenue += (sale.unitPrice?.toNumber() || 0);
    });

    // Get all products with current stock
    const products = await this.prisma.product.findMany();

    const suggestions = products.map((product) => {
      const productSales = salesByProduct[product.id] || { totalQuantity: 0, totalRevenue: 0 };
      const avgDailySales = productSales.totalQuantity / days;
      const leadTimeStock = avgDailySales * leadDays;
      const suggestedReorder = Math.max(0, Math.ceil(leadTimeStock + safety - toNumber(product.quantity)));
      const isLowStock = toNumber(product.quantity) <= toNumber(product.reorderThreshold);

      return {
        productId: product.id,
        productName: product.name,
        currentStock: toNumber(product.quantity),
        reorderThreshold: toNumber(product.reorderThreshold),
        avgDailySales: Math.round(avgDailySales * 100) / 100,
        leadTimeStock: Math.round(leadTimeStock * 100) / 100,
        suggestedReorderQuantity: suggestedReorder,
        totalRevenue: Math.round(productSales.totalRevenue * 100) / 100,
        isLowStock,
      };
    });

    // Sort by suggested reorder quantity descending
    suggestions.sort((a, b) => b.suggestedReorderQuantity - a.suggestedReorderQuantity);

    return suggestions;
  }

  private formatProductWithTransactions(product: any) {
    return {
      ...this.formatProduct(product),
      transactions: (product.transactions || []).map((t: any) => ({
        id: t.id,
        type: t.type,
        quantity: toNumber(t.quantity),
        timestamp: t.timestamp.toISOString(),
        unitPrice: t.unitPrice != null ? toNumber(t.unitPrice) : null,
        note: t.note,
      })),
    };
  }
}
