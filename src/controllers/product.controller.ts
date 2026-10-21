import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import {
  createProductSchema,
  updateProductSchema,
  getProductParamsSchema,
  listProductsQuerySchema,
} from '../schemas';

export class ProductController {
  constructor(private productService: ProductService) {}

  async list(req: Request, res: Response): Promise<void> {
    const parsed = listProductsQuerySchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const { search, lowStock, page, limit } = parsed.data.query;
    const result = await this.productService.listProducts({ search, lowStock, page, limit });
    res.json(result);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const parsed = getProductParamsSchema.safeParse({ params: req.params });
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const product = await this.productService.getProduct(parsed.data.params.id);
    res.json(product);
  }

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createProductSchema.safeParse(req);
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const product = await this.productService.createProduct(parsed.data.body);
    res.status(201).json(product);
  }

  async update(req: Request, res: Response): Promise<void> {
    const parsed = updateProductSchema.safeParse({ params: req.params, body: req.body });
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    const product = await this.productService.updateProduct(parsed.data.params.id, parsed.data.body);
    res.json(product);
  }

  async remove(req: Request, res: Response): Promise<void> {
    const parsed = getProductParamsSchema.safeParse({ params: req.params });
    if (!parsed.success) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors.map((e) => e.message).join(', ') } });
      return;
    }

    await this.productService.deleteProduct(parsed.data.params.id);
    res.json({ message: 'Product deleted successfully' });
  }
}
