import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  // Bot configuration
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Web app configuration
  APP_URL: process.env.APP_URL || 'https://web-production-5e072.up.railway.app',
  
  // Paths
  PUBLIC_PATH: join(dirname(dirname(__dirname)), 'public'),
  
  // Webhook
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || '/webhook',
  
  // Validation
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development'
}; 