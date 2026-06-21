import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? err.statusCode ?? 500;
  console.error(`[${new Date().toISOString()}] Error ${status}:`, err);
  res.status(status).json({ error: err.message || 'Internal server error' });
}
