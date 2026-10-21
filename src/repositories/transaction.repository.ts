import { PrismaClient, Transaction } from '@prisma/client';

export class TransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    productId: string;
    type: 'sale' | 'stock-in' | 'adjustment' | 'reversal';
    quantity: number;
    timestamp?: Date;
    unitPrice?: number | null;
    note?: string | null;
  }) {
    return this.prisma.transaction.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        timestamp: data.timestamp ?? new Date(),
        unitPrice: data.unitPrice != null ? data.unitPrice : null,
        note: data.note ?? null,
      },
      include: { product: true },
    });
  }

  async findByProduct(productId: string, limit = 50) {
    return this.prisma.transaction.findMany({
      where: { productId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { product: true },
    });
  }

  async findAll({
    from,
    to,
    type,
    productId,
    page,
    limit,
  }: {
    from?: Date;
    to?: Date;
    type?: string;
    productId?: string;
    page: number;
    limit: number;
  }) {
    const where: {
      timestamp?: { gte?: Date; lte?: Date };
      type?: string;
      productId?: string;
    } = {};

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to) where.timestamp.lte = to;
    }

    if (type) where.type = type;
    if (productId) where.productId = productId;

    const skip = (page - 1) * limit;

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: { product: { select: { id: true, name: true, unit: true } } },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { transactions, total, page, limit };
  }

  async getSalesByPeriod(from: Date, to: Date) {
    return this.prisma.transaction.findMany({
      where: {
        type: 'sale',
        timestamp: { gte: from, lte: to },
      },
      include: { product: true },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getTransactionsByPeriod(from: Date, to: Date) {
    return this.prisma.transaction.findMany({
      where: {
        timestamp: { gte: from, lte: to },
      },
      include: { product: true },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getAllProducts() {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        quantity: true,
        reorderThreshold: true,
        purchaseCost: true,
        sellingPrice: true,
        unit: true,
      },
    });
  }
}