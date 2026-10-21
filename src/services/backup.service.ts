import { PrismaClient } from '@prisma/client';
import { ProductRepository } from '../repositories/product.repository';
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

export interface BackupExport {
  schemaVersion: string;
  exportedAt: string;
  products: Array<{
    id: string;
    name: string;
    category: string | null;
    unit: string;
    quantity: number;
    reorderThreshold: number;
    purchaseCost: number | null;
    sellingPrice: number | null;
    supplierId: string | null;
    expiryDate: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  transactions: Array<{
    id: string;
    productId: string;
    type: string;
    quantity: number;
    timestamp: string;
    unitPrice: number | null;
    note: string | null;
  }>;
}

export class BackupService {
  private productRepo: ProductRepository;
  private txRepo: TransactionRepository;

  constructor(prisma: PrismaClient) {
    this.productRepo = new ProductRepository(prisma);
    this.txRepo = new TransactionRepository(prisma);
  }

  async export(format: 'json' | 'csv' = 'json'): Promise<string | { csv: string; productsCsv: string; transactionsCsv: string }> {
    const products = await this.productRepo.prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        transactions: { orderBy: { timestamp: 'asc' } },
      },
    });

    const exportData: BackupExport = {
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        unit: p.unit,
        quantity: toNumber(p.quantity),
        reorderThreshold: toNumber(p.reorderThreshold),
        purchaseCost: p.purchaseCost != null ? toNumber(p.purchaseCost) : null,
        sellingPrice: p.sellingPrice != null ? toNumber(p.sellingPrice) : null,
        supplierId: p.supplierId,
        expiryDate: p.expiryDate ? p.expiryDate.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      transactions: [],
    };

    // Flatten transactions from product include
    for (const p of products) {
      for (const t of (p.transactions as any[]) || []) {
        exportData.transactions.push({
          id: t.id,
          productId: p.id,
          type: t.type,
          quantity: toNumber(t.quantity),
          timestamp: t.timestamp.toISOString(),
          unitPrice: t.unitPrice != null ? toNumber(t.unitPrice) : null,
          note: t.note,
        });
      }
    }

    if (format === 'csv') {
      return this.toCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  private toCSV(data: BackupExport): { csv: string; productsCsv: string; transactionsCsv: string } {
    const productsHeader = 'id,name,category,unit,quantity,reorderThreshold,purchaseCost,sellingPrice,supplierId,expiryDate,createdAt,updatedAt';
    const productsRows = data.products.map((p) =>
      [p.id, p.name, p.category ?? '', p.unit, p.quantity, p.reorderThreshold, p.purchaseCost ?? '', p.sellingPrice ?? '', p.supplierId ?? '', p.expiryDate ?? '', p.createdAt, p.updatedAt].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const productsCsv = [productsHeader, ...productsRows].join('\n');

    const transactionsHeader = 'id,productId,type,quantity,timestamp,unitPrice,note';
    const transactionsRows = data.transactions.map((t) =>
      [t.id, t.productId, t.type, t.quantity, t.timestamp, t.unitPrice ?? '', t.note ?? ''].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const transactionsCsv = [transactionsHeader, ...transactionsRows].join('\n');

    return { csv: productsCsv + '\n\n' + transactionsCsv, productsCsv, transactionsCsv };
  }

  async validateImport(jsonData: string): Promise<{ valid: boolean; errors: string[]; productCount: number; transactionCount: number }> {
    const errors: string[] = [];
    let parsed: any;

    try {
      parsed = JSON.parse(jsonData);
    } catch {
      return { valid: false, errors: ['Invalid JSON format'], productCount: 0, transactionCount: 0 };
    }

    if (!parsed.schemaVersion) {
      errors.push('Missing schemaVersion');
    }

    if (!Array.isArray(parsed.products)) {
      errors.push('Missing or invalid products array');
    } else {
      parsed.products.forEach((p: any, i: number) => {
        if (!p.name) errors.push(`Product at index ${i}: missing name`);
        if (!p.unit) errors.push(`Product at index ${i}: missing unit`);
        if (p.quantity != null && isNaN(Number(p.quantity))) errors.push(`Product at index ${i}: invalid quantity`);
      });
    }

    if (parsed.transactions && !Array.isArray(parsed.transactions)) {
      errors.push('Invalid transactions array');
    }

    return {
      valid: errors.length === 0,
      errors,
      productCount: Array.isArray(parsed.products) ? parsed.products.length : 0,
      transactionCount: Array.isArray(parsed.transactions) ? parsed.transactions.length : 0,
    };
  }
}
