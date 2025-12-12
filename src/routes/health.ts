import type { Request, Response } from 'express';

/**
 * Health check endpoint handler.
 * Returns the server's health status.
 */
export const getHealth = (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
};