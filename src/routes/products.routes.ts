import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { ProductService } from '../services/product.service';
import { catchAsync } from '../middleware/async-handler';

let productController: ProductController;

export function setProductController(controller: ProductController): void {
  productController = controller;

  router.get('/', catchAsync(productController.list.bind(productController)));
  router.get('/:id', catchAsync(productController.getById.bind(productController)));
  router.post('/', catchAsync(productController.create.bind(productController)));
  router.patch('/:id', catchAsync(productController.update.bind(productController)));
  router.delete('/:id', catchAsync(productController.remove.bind(productController)));
}

const router = Router();

export { router };
export default router;
