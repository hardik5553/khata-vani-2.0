import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { catchAsync } from '../middleware/async-handler';

const router = Router();
const healthController = new HealthController();

router.get('/', catchAsync(healthController.health.bind(healthController)));

export default router;
