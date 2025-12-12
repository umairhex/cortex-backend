import type { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware.
 * Logs the error stack and sends a 500 response.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
};

/**
 * 404 Not Found handler.
 * Sends a 404 response for unmatched routes.
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
};