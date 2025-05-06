require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');
const cors = require('cors');

// Configuration
const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  PORT: process.env.PORT || 3000,
  APP_URL: process.env.APP_URL || 'https://web-production-5e072.up.railway.app',
  NODE_ENV: process.env.NODE_ENV || 'development',
  WEBHOOK_PATH: process.env.WEBHOOK_PATH || '/webhook'
};

// Validation
if (!config.BOT_TOKEN) {
  console.error('BOT_TOKEN is required');
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
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
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
bot.command('start', async (ctx) => {
  try {
    const webAppUrl = config.APP_URL.replace(/\/$/, '');
    
    await ctx.reply('🌟 Добро пожаловать в ESENTION - премиальный магазин одежды!\n\n🛍️ У нас вы найдете:\n- Премиальную одежду\n- Эксклюзивные коллекции\n- Стильные образы\n\nВыберите категорию:', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎭 Old Money', web_app: { url: `${webAppUrl}?category=oldmoney` } },
            { text: '🌆 Streetwear', web_app: { url: `${webAppUrl}?category=streetwear` } }
          ],
          [
            { text: '✨ Luxury', web_app: { url: `${webAppUrl}?category=luxury` } },
            { text: '🏃‍♂️ Sport', web_app: { url: `${webAppUrl}?category=sport` } }
          ],
          [
            { text: '👔 Мужская коллекция', web_app: { url: `${webAppUrl}?gender=men` } },
            { text: '👗 Женская коллекция', web_app: { url: `${webAppUrl}?gender=women` } }
          ],
          [{
            text: '🛍 Открыть каталог',
            web_app: { url: webAppUrl }
          }]
        ]
      }
    });
    console.log(`Start command handled for user ${ctx.from.id}, using URL: ${webAppUrl}`);
  } catch (error) {
    console.error('Error in /start command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

bot.command('help', async (ctx) => {
  try {
    await ctx.reply(
      '🛍️ *ESENTION Shop* - ваш премиальный магазин одежды\n\n' +
      '*Доступные команды:*\n' +
      '/start - Открыть главное меню\n' +
      '/catalog - Открыть каталог\n' +
      '/help - Показать это сообщение\n\n' +
      '*Категории одежды:*\n' +
      '• Old Money - Элегантность и классика\n' +
      '• Streetwear - Современный уличный стиль\n' +
      '• Luxury - Премиальные коллекции\n' +
      '• Sport - Спортивная одежда\n\n' +
      'Для совершения покупки выберите категорию в меню и добавьте товары в корзину.',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error in /help command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

bot.command('catalog', async (ctx) => {
  try {
    const webAppUrl = config.APP_URL.replace(/\/$/, '');
    await ctx.reply('Выберите категорию:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎭 Old Money', web_app: { url: `${webAppUrl}?category=oldmoney` } },
            { text: '🌆 Streetwear', web_app: { url: `${webAppUrl}?category=streetwear` } }
          ],
          [
            { text: '✨ Luxury', web_app: { url: `${webAppUrl}?category=luxury` } },
            { text: '🏃‍♂️ Sport', web_app: { url: `${webAppUrl}?category=sport` } }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Error in /catalog command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

// Handle web app data
bot.on('message', async (ctx) => {
  if (ctx.message?.web_app_data?.data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      await ctx.reply(
        '✨ Спасибо за заказ!\n\n' +
        `🛍 Сумма заказа: ${data.totalAmount} ₽\n\n` +
        'Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа и уточнения деталей доставки.',
        { parse_mode: 'HTML' }
      );
      console.log(`Order received from user ${ctx.from.id}:`, data);
    } catch (error) {
      console.error('Error processing web app data:', error);
      await ctx.reply('Произошла ошибка при оформлении заказа. Попробуйте позже.');
    }
  }
});

// Set bot commands
bot.telegram.setMyCommands([
  { command: 'start', description: 'Открыть главное меню' },
  { command: 'catalog', description: 'Открыть каталог товаров' },
  { command: 'help', description: 'Показать помощь' }
]).catch(error => {
  console.error('Error setting bot commands:', error);
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// Start server and bot
const startServer = async () => {
  try {
    // Start Express server
    const server = app.listen(config.PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${config.PORT}`);
      console.log(`Web app URL: ${config.APP_URL}`);
      console.log(`Environment: ${config.NODE_ENV}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    if (config.NODE_ENV === 'production') {
      // Set webhook in production
      await bot.telegram.setWebhook(`${config.APP_URL}${config.WEBHOOK_PATH}`);
      app.use(bot.webhookCallback(config.WEBHOOK_PATH));
      console.log('Webhook set up successfully');
    } else {
      // Use polling in development
      await bot.launch();
      console.log('Bot started in polling mode');
    }

    // Graceful shutdown
    const shutdown = () => {
      server.close(() => {
        console.log('Server stopped');
        bot.stop('SIGTERM');
        process.exit(0);
      });
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();