import { z } from 'zod';

const unitSchema = z.enum(['piece', 'packet', 'kg', 'litre']);

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required').trim(),
    category: z.string().min(1).optional().nullable(),
    unit: unitSchema.default('piece'),
    quantity: z.preprocess(
      (val) => (val === undefined || val === '' ? 0 : Number(val)),
      z.number().nonnegative('Quantity must be non-negative').optional().default(0)
    ),
    reorderThreshold: z.preprocess(
      (val) => (val === undefined || val === '' ? 0 : Number(val)),
      z.number().nonnegative('Reorder threshold must be non-negative').optional().default(0)
    ),
    purchaseCost: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().nonnegative('Purchase cost must be non-negative').optional().nullable()
    ),
    sellingPrice: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().nonnegative('Selling price must be non-negative').optional().nullable()
    ),
    supplierId: z.string().optional().nullable(),
    expiryDate: z.string().datetime().optional().nullable(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional().nullable(),
    unit: unitSchema.optional(),
    quantity: z.preprocess(
      (val) => (val === undefined || val === '' ? undefined : Number(val)),
      z.number().nonnegative().optional()
    ),
    reorderThreshold: z.preprocess(
      (val) => (val === undefined || val === '' ? undefined : Number(val)),
      z.number().nonnegative().optional()
    ),
    purchaseCost: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().nonnegative().optional().nullable()
    ),
    sellingPrice: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().nonnegative().optional().nullable()
    ),
    supplierId: z.string().optional().nullable(),
    expiryDate: z.string().datetime().optional().nullable(),
  }),
});

export const getProductParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    lowStock: z.preprocess(
      (val) => val === 'true' || val === true,
      z.boolean().optional()
    ),
    page: z.preprocess((val) => (val ? parseInt(String(val), 10) : 1), z.number().int().min(1).optional().default(1)),
    limit: z.preprocess((val) => (val ? parseInt(String(val), 10) : 50), z.number().int().min(1).max(100).optional().default(50)),
  }),
});

// SQLite does not support 'mode: insensitive' in Prisma string filters.
// Case-insensitive search is handled in the service layer.

export const recordSaleSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.preprocess(
      (val) => Number(val),
      z.number().positive('Sale quantity must be greater than 0')
    ),
    soldPrice: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().nonnegative().optional().nullable()
    ),
    timestamp: z.string().datetime().optional(),
    note: z.string().optional().nullable(),
  }),
});

export const recordStockInSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    quantity: z.preprocess(
      (val) => Number(val),
      z.number().positive('Stock-in quantity must be greater than 0')
    ),
    unitCost: z.preprocess(
      (val) => (val === undefined || val === '' || val === null ? undefined : Number(val)),
      z.number().nonnegative().optional().nullable()
    ),
    supplier: z.string().optional().nullable(),
    timestamp: z.string().datetime().optional(),
    note: z.string().optional().nullable(),
  }),
});

export const recordAdjustmentSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Invalid product ID'),
    delta: z.preprocess((val) => Number(val), z.number()),
    reason: z.string().min(1, 'Reason is required for adjustments'),
    timestamp: z.string().datetime().optional(),
    note: z.string().optional().nullable(),
  }),
});

export const transactionHistoryQuerySchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    type: z.enum(['sale', 'stock-in', 'adjustment', 'reversal']).optional(),
    productId: z.string().uuid().optional(),
    page: z.preprocess((val) => (val ? parseInt(String(val), 10) : 1), z.number().int().min(1).optional().default(1)),
    limit: z.preprocess((val) => (val ? parseInt(String(val), 10) : 50), z.number().int().min(1).max(100).optional().default(50)),
  }),
});

export const reportsSummaryQuerySchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const reorderSuggestionsQuerySchema = z.object({
  query: z.object({
    lookbackDays: z.preprocess(
      (val) => (val ? parseInt(String(val), 10) : 30),
      z.number().int().min(1).max(365).optional().default(30)
    ),
    leadTimeDays: z.preprocess(
      (val) => (val ? parseInt(String(val), 10) : 7),
      z.number().int().min(0).max(365).optional().default(7)
    ),
    safetyStock: z.preprocess(
      (val) => (val ? parseFloat(String(val)) : 0),
      z.number().nonnegative().optional().default(0)
    ),
  }),
});

export const backupExportQuerySchema = z.object({
  query: z.object({
    format: z.enum(['json', 'csv']).default('json'),
  }),
});
