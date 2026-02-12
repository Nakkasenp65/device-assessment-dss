import { type Response } from 'express';

export const sendResponse = (res: Response, statusCode: number, data: any, message?: string) => {
  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};
