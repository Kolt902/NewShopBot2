import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
}; 