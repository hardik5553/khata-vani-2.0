import { PrismaClient, Product, Transaction } from '@prisma/client';

export class ProductRepository {
  // Expose prisma for use by services running transactions
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll({
    search,
    lowStock,
    page,
    limit,
  }: {
    search?: string;
    lowStock?: boolean;
    page: number;
    limit: number;
  }) {
    const where: Record<string, unknown> = {};

    if (search) {
      where.name = { contains: search };
    }

    if (lowStock) {
      // Low stock flag set - actual filtering done in product service
      // since SQLite cross-field comparison (quantity <= reorderThreshold) is complex
    }

    const skip = (page - 1) * limit;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { transactions: true } } },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { transactions: { orderBy: { timestamp: 'desc' }, take: 50 } },
    });
  }

  async create(data: {
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
    return this.prisma.product.create({
      data: {
        name: data.name,
        category: data.category ?? null,
        unit: data.unit,
        quantity: data.quantity,
        reorderThreshold: data.reorderThreshold,
        purchaseCost: data.purchaseCost != null ? data.purchaseCost : null,
        sellingPrice: data.sellingPrice != null ? data.sellingPrice : null,
        supplierId: data.supplierId ?? null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
  }

  async update(id: string, data: Partial<{
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
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.reorderThreshold !== undefined) updateData.reorderThreshold = data.reorderThreshold;
    if (data.purchaseCost !== undefined) updateData.purchaseCost = data.purchaseCost != null ? data.purchaseCost : null;
    if (data.sellingPrice !== undefined) updateData.sellingPrice = data.sellingPrice != null ? data.sellingPrice : null;
    if (data.supplierId !== undefined) updateData.supplierId = data.supplierId;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async decrementStock(productId: string, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  async incrementStock(productId: string, quantity: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });
  }

  async adjustStock(productId: string, delta: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          increment: delta,
        },
      },
    });
  }
}