import winston from 'winston';
import { config } from './config.js';

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.simple()
);

const logger = winston.createLogger({
  level: config.isDevelopment ? 'debug' : 'info',
  format,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export { logger }; 