import { Router } from 'express';
import { ReorderController } from '../controllers/reorder.controller';
import { ReorderService } from '../services/reorder.service';
import { catchAsync } from '../middleware/async-handler';

let reorderController: ReorderController;

export function setReorderController(controller: ReorderController): void {
  reorderController = controller;
  router.get('/', catchAsync(reorderController.suggestions.bind(reorderController)));
}

const router = Router();

export { router };
export default router;
