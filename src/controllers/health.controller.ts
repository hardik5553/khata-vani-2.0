import { Request, Response } from 'express';
import { nemotronService } from '../ai/nemotron-provider';

export class HealthController {
  async health(_req: Request, res: Response): Promise<void> {
    const aiHealth = await nemotronService.checkAiHealth();

    res.json({
      status: 'ok',
      service: 'khata-vani-backend',
      appName: 'Khata Vani',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      ai: aiHealth,
    });
  }
}
