import { NextFunction, Request, Response } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export class HttpError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown>;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const body: Record<string, unknown> = {
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
    },
  };

  if (err.details) {
    ;(body.error as Record<string, unknown>).details = err.details;
  }

  // Never expose stack traces in production
  if (!isProduction && err.stack) {
    ;(body.error as Record<string, unknown>).stack = err.stack;
  }

  // Attach a request ID for diagnostics if present
  const requestId = (_req as { requestId?: string }).requestId;
  if (requestId) {
    ;(body.error as Record<string, unknown>).requestId = requestId;
  }

  return res.status(statusCode).json(body);
};

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new HttpError('Resource not found', 404, 'NOT_FOUND'));
};