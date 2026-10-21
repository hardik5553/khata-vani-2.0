import { NextFunction, Request, Response } from 'express';

export const requestIdMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  (_req as unknown as { requestId?: string }).requestId =
    _req.headers['x-request-id'] as string || crypto.randomUUID();
  next();
};
