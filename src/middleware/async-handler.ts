import { NextFunction, Request, Response } from 'express';
import { AppError } from './error-handler';

/**
 * Wraps an async Express route handler so that thrown errors
 * are forwarded to Express's error-handling middleware via next(err).
 * Without this, Express 4 does not catch async rejections,
 * causing requests to hang indefinitely.
 */
export function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
