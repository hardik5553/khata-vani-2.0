import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createServer } from 'http';
import { createApp } from '../src/app';
import { prisma } from './setup';

let server: ReturnType<typeof createServer>;
let baseUrl: string;

beforeAll(async () => {
  await prisma.$connect();
  const app = createApp();
  server = app.listen(0); // random available port
  await new Promise<void>((resolve) => server!.once('listening', resolve));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 3099;
  baseUrl = `http://localhost:${port}`;
});

afterAll(async () => {
  server.close();
  await prisma.$disconnect();
  try {
    require('fs').unlinkSync('./test.db');
  } catch {
    // ignore
  }
});

afterEach(async () => {
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
});

// Helper to make requests using fetch
async function request(method: string, path: string, body?: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: res.status,
    headers: res.headers,
    json: async () => {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return res.json();
      return res.text();
    },
    text: async () => res.text(),
  };
}

describe('Product CRUD API', () => {
  it('should create a product and return it', async () => {
    const res = await request('POST', '/api/v1/products', {
      name: 'Biscuit Packets',
      category: 'Snacks',
      unit: 'packet',
      quantity: 15,
      reorderThreshold: 10,
      purchaseCost: 8.0,
      sellingPrice: 12.0,
    });

    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.name).toBe('Biscuit Packets');
    expect(body.quantity).toBe(15);
    expect(body.unit).toBe('packet');
    expect(body.id).toBeDefined();
    expect(body.lowStock).toBe(false);
  });

  it('should reject product with blank name', async () => {
    const res = await request('POST', '/api/v1/products', {
      name: '',
      unit: 'piece',
      quantity: 5,
    });

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject negative quantity', async () => {
    const res = await request('POST', '/api/v1/products', {
      name: 'Test Product',
      unit: 'piece',
      quantity: -5,
    });

    expect(res.status).toBe(400);
  });

  it('should list all products', async () => {
    await request('POST', '/api/v1/products', { name: 'Rice', unit: 'kg', quantity: 20 });
    await request('POST', '/api/v1/products', { name: 'Soap', unit: 'piece', quantity: 8 });

    const res = await request('GET', '/api/v1/products');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.products.length).toBe(2);
  });

  it('should search products by name', async () => {
    await request('POST', '/api/v1/products', { name: 'Biscuit Packets', unit: 'packet', quantity: 15 });
    await request('POST', '/api/v1/products', { name: 'Rice', unit: 'kg', quantity: 20 });

    const res = await request('GET', '/api/v1/products?search=biscuit');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.products.length).toBe(1);
    expect(body.products[0].name).toBe('Biscuit Packets');
  });

  it('should return low-stock products when lowStock=true', async () => {
    await request('POST', '/api/v1/products', { name: 'Rice', unit: 'kg', quantity: 20, reorderThreshold: 5 });
    await request('POST', '/api/v1/products', { name: 'Soap', unit: 'piece', quantity: 2, reorderThreshold: 5 });

    const res = await request('GET', '/api/v1/products?lowStock=true');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    const lowStock = body.products.filter((p: any) => p.lowStock);
    expect(lowStock.length).toBeGreaterThanOrEqual(1);
  });

  it('should get a single product by id', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Test Product',
      unit: 'piece',
      quantity: 10,
    });
    const body: any = await createRes.json();
    const id = body.id;

    const res = await request('GET', `/api/v1/products/${id}`);
    expect(res.status).toBe(200);
    const product: any = await res.json();
    expect(product.id).toBe(id);
    expect(product.name).toBe('Test Product');
  });

  it('should return 404 for non-existent product', async () => {
    const res = await request('GET', '/api/v1/products/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  it('should update a product', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Original Name',
      unit: 'piece',
      quantity: 10,
    });
    const body: any = await createRes.json();

    const res = await request('PATCH', `/api/v1/products/${body.id}`, {
      name: 'Updated Name',
      quantity: 25,
    });
    expect(res.status).toBe(200);
    const updated: any = await res.json();
    expect(updated.name).toBe('Updated Name');
    expect(updated.quantity).toBe(25);
  });

  it('should delete a product', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'To Delete',
      unit: 'piece',
      quantity: 1,
    });
    const body: any = await createRes.json();

    const res = await request('DELETE', `/api/v1/products/${body.id}`);
    expect(res.status).toBe(200);

    const getRes = await request('GET', `/api/v1/products/${body.id}`);
    expect(getRes.status).toBe(404);
  });

  it('should support fractional quantities (e.g. 0.5 kg)', async () => {
    const res = await request('POST', '/api/v1/products', {
      name: 'Loose Rice',
      unit: 'kg',
      quantity: 0.5,
      reorderThreshold: 1,
    });
    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.quantity).toBe(0.5);
  });
});

describe('Sales API', () => {
  it('should record a sale and decrement stock', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Biscuit Packets',
      unit: 'packet',
      quantity: 15,
      sellingPrice: 12.0,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/sales', {
      productId: product.id,
      quantity: 3,
      soldPrice: 12.0,
    });

    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.product.quantity).toBe(12); // 15 - 3 = 12
    expect(body.transaction.type).toBe('sale');
    expect(body.transaction.quantity).toBe(3);
  });

  it('should reject overselling (sale quantity > available stock)', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Soap',
      unit: 'piece',
      quantity: 5,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/sales', {
      productId: product.id,
      quantity: 10,
    });

    expect(res.status).toBe(409);
    const body: any = await res.json();
    // Handle both body.error.code and direct error code formats
    expect(body.error?.code || body.code).toBe('INSUFFICIENT_STOCK');
    expect(body.error?.details?.available).toBe(5);
    expect(body.error?.details?.requested).toBe(10);
  });

  it('should reject sale with zero or negative quantity', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Test',
      unit: 'piece',
      quantity: 10,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/sales', {
      productId: product.id,
      quantity: 0,
    });
    expect(res.status).toBe(400);
  });

  it('should reject sale for non-existent product', async () => {
    const res = await request('POST', '/api/v1/transactions/sales', {
      productId: '00000000-0000-0000-0000-000000000000',
      quantity: 1,
    });
    expect(res.status).toBe(404);
  });

  it('should record sale atomically - product and transaction both created', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Atomic Test',
      unit: 'piece',
      quantity: 10,
    });
    const product: any = await createRes.json();

    const saleRes = await request('POST', '/api/v1/transactions/sales', {
      productId: product.id,
      quantity: 2,
    });
    expect(saleRes.status).toBe(201);

    const getRes = await request('GET', `/api/v1/products/${product.id}`);
    const updated: any = await getRes.json();
    expect(updated.quantity).toBe(8);

    const histRes = await request('GET', '/api/v1/transactions');
    const history: any = await histRes.json();
    expect(history.transactions.length).toBeGreaterThanOrEqual(1);
    const saleTx = history.transactions.find((t: any) => t.productId === product.id && t.type === 'sale');
    expect(saleTx).toBeDefined();
    expect(saleTx.quantity).toBe(2);
  });
});

describe('Stock-in API', () => {
  it('should record stock-in and increment quantity', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Rice',
      unit: 'kg',
      quantity: 20,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/stock-in', {
      productId: product.id,
      quantity: 10,
      unitCost: 45.0,
      supplier: 'Test Supplier',
    });

    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.product.quantity).toBe(30); // 20 + 10
    expect(body.transaction.type).toBe('stock-in');
  });

  it('should reject zero or negative stock-in quantity', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Test',
      unit: 'piece',
      quantity: 5,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/stock-in', {
      productId: product.id,
      quantity: 0,
    });
    expect(res.status).toBe(400);
  });
});

describe('Adjustment API', () => {
  it('should record positive adjustment', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Adjustment Test',
      unit: 'piece',
      quantity: 10,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/adjustments', {
      productId: product.id,
      delta: 5,
      reason: 'Found extra stock',
    });
    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.product.quantity).toBe(15);
  });

  it('should record negative adjustment', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Neg Adj Test',
      unit: 'piece',
      quantity: 10,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/adjustments', {
      productId: product.id,
      delta: -3,
      reason: 'Damaged goods',
    });
    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.product.quantity).toBe(7);
  });

  it('should reject adjustment resulting in negative stock', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Neg Stock',
      unit: 'piece',
      quantity: 2,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/adjustments', {
      productId: product.id,
      delta: -5,
      reason: 'Error correction',
    });
    expect(res.status).toBe(409);
    const body: any = await res.json();
    // Handle both body.error.code and direct error code formats
    expect(body.error?.code || body.code).toBe('NEGATIVE_STOCK');
  });

  it('should require reason for adjustment', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'No Reason',
      unit: 'piece',
      quantity: 10,
    });
    const product: any = await createRes.json();

    const res = await request('POST', '/api/v1/transactions/adjustments', {
      productId: product.id,
      delta: 1,
    });
    expect(res.status).toBe(400);
  });
});

describe('Transaction History API', () => {
  it('should return transaction history', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'History Test',
      unit: 'piece',
      quantity: 10,
    });
    const product: any = await createRes.json();

    await request('POST', '/api/v1/transactions/sales', {
      productId: product.id,
      quantity: 2,
    });
    await request('POST', '/api/v1/transactions/stock-in', {
      productId: product.id,
      quantity: 5,
    });

    const res = await request('GET', '/api/v1/transactions');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.transactions.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter transactions by type', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Filter Test',
      unit: 'piece',
      quantity: 10,
    });
    const product: any = await createRes.json();

    await request('POST', '/api/v1/transactions/sales', {
      productId: product.id,
      quantity: 1,
    });

    const res = await request('GET', '/api/v1/transactions?type=sale');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.transactions.every((t: any) => t.type === 'sale')).toBe(true);
  });
});

describe('Reorder Suggestions API', () => {
  it('should return reorder suggestions for all products', async () => {
    await request('POST', '/api/v1/products', {
      name: 'Rice',
      unit: 'kg',
      quantity: 2,
      reorderThreshold: 5,
    });
    await request('POST', '/api/v1/products', {
      name: 'Soap',
      unit: 'piece',
      quantity: 20,
      reorderThreshold: 5,
    });

    const res = await request('GET', '/api/v1/reorder-suggestions');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(Array.isArray(body.suggestions)).toBe(true);
    expect(body.suggestions.length).toBe(2);
  });

  it('should include explanation and confidence', async () => {
    await request('POST', '/api/v1/products', {
      name: 'Test Product',
      unit: 'piece',
      quantity: 1,
      reorderThreshold: 5,
    });

    const res = await request('GET', '/api/v1/reorder-suggestions');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    const suggestion = body.suggestions[0];
    expect(suggestion.reason).toBeDefined();
    expect(suggestion.dataConfidence).toBeDefined();
    expect(suggestion.fallbackUsed).toBeDefined();
    expect(suggestion.suggestedOrderQty).toBeDefined();
  });

  it('should suggest order quantity for low stock items', async () => {
    await request('POST', '/api/v1/products', {
      name: 'Low Stock Item',
      unit: 'piece',
      quantity: 1,
      reorderThreshold: 10,
    });

    const res = await request('GET', '/api/v1/reorder-suggestions?leadTimeDays=7&safetyStock=0');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    const suggestion = body.suggestions.find((s: any) => s.productName === 'Low Stock Item');
    expect(suggestion).toBeDefined();
    expect(suggestion.suggestedOrderQty).toBeGreaterThanOrEqual(0);
  });
});

describe('Reports API', () => {
  it('should return sales summary', async () => {
    const createRes = await request('POST', '/api/v1/products', {
      name: 'Report Product',
      unit: 'piece',
      quantity: 10,
      purchaseCost: 5.0,
      sellingPrice: 10.0,
    });
    const product: any = await createRes.json();

    await request('POST', '/api/v1/transactions/sales', {
      productId: product.id,
      quantity: 3,
      soldPrice: 10.0,
    });

    const res = await request('GET', '/api/v1/reports/summary');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.totalProducts).toBeGreaterThanOrEqual(1);
    expect(body.totalSales).toBeGreaterThanOrEqual(3);
    expect(body.period).toBeDefined();
    expect(body.note).toBeDefined();
  });

  it('should indicate when cost data is missing', async () => {
    await request('POST', '/api/v1/products', {
      name: 'No Cost Product',
      unit: 'piece',
      quantity: 5,
    });

    const res = await request('GET', '/api/v1/reports/summary');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.costDataAvailable).toBe(false);
    expect(body.note).toContain('cost');
  });
});

describe('Backup API', () => {
  it('should export backup as JSON', async () => {
    await request('POST', '/api/v1/products', {
      name: 'Backup Product',
      unit: 'piece',
      quantity: 5,
    });

    const res = await request('GET', '/api/v1/reports/export?format=json');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.schemaVersion).toBe('1.0.0');
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThanOrEqual(1);
    expect(body.exportedAt).toBeDefined();
  });

  it('should export backup as CSV', async () => {
    await request('POST', '/api/v1/products', {
      name: 'CSV Product',
      unit: 'piece',
      quantity: 5,
    });

    const res = await request('GET', '/api/v1/reports/export?format=csv');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    const text: string = await res.text();
    expect(text).toContain('CSV Product');
  });
});

describe('Health API', () => {
  it('should return health status', async () => {
    const res = await request('GET', '/health');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.status).toBe('ok');
  });

  it('should return health status at /api/v1/health', async () => {
    const res = await request('GET', '/api/v1/health');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.status).toBe('ok');
  });
});
