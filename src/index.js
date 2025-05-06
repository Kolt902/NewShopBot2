import express from 'express';
import { Telegraf } from 'telegraf';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config/config.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startCommand, helpCommand, catalogCommand, handleWebAppData } from './handlers/botHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required environment variables
if (!config.BOT_TOKEN) {
  logger.error('BOT_TOKEN is required');
  process.exit(1);
}

// Initialize Express and Bot
const app = express();
const bot = new Telegraf(config.BOT_TOKEN);

// Add config to context
bot.context.config = config;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(config.PUBLIC_PATH));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    bot: bot.isRunning ? 'running' : 'stopped',
    environment: config.NODE_ENV,
    url: config.APP_URL
  });
});

// Bot commands
bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('catalog', catalogCommand);
bot.on('message', handleWebAppData);

// Set bot commands
bot.telegram.setMyCommands([
  { command: 'start', description: 'Открыть главное меню' },
  { command: 'catalog', description: 'Открыть каталог товаров' },
  { command: 'help', description: 'Показать помощь' }
]).catch(error => {
  logger.error('Error setting bot commands:', error);
});

// Error handling
bot.catch((err, ctx) => {
  logger.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

app.use(errorHandler);

// Start server and bot
const startServer = async () => {
  try {
    // Start Express server
    const server = app.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.PORT}`);
      logger.info(`Web app URL: ${config.APP_URL}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });

    if (config.isProduction) {
      // Set webhook in production
      await bot.telegram.setWebhook(`${config.APP_URL}${config.WEBHOOK_PATH}`);
      app.use(bot.webhookCallback(config.WEBHOOK_PATH));
      logger.info('Webhook set up successfully');
    } else {
      // Use polling in development
      await bot.launch();
      logger.info('Bot started in polling mode');
    }

    // Graceful shutdown
    const shutdown = () => {
      server.close(() => {
        logger.info('Server stopped');
        bot.stop('SIGTERM');
        process.exit(0);
      });
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 