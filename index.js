require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');
const cors = require('cors');

// Configuration
const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  PORT: process.env.PORT || 3000,
  APP_URL: process.env.APP_URL || 'https://web-production-5e072.up.railway.app'
};

// Validation
if (!config.BOT_TOKEN) {
  console.error('BOT_TOKEN is required');
  process.exit(1);
}

// Initialize Express and Bot
const app = express();
const bot = new Telegraf(config.BOT_TOKEN);

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
    url: config.APP_URL
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Bot commands
bot.command('start', async (ctx) => {
  try {
    const webAppUrl = config.APP_URL.replace(/\/$/, ''); // Удаляем trailing slash если есть
    
    await ctx.reply('🌟 Добро пожаловать в ESENTION - премиальный магазин одежды!', {
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

// Handle web app data
bot.on('message', async (ctx) => {
  if (ctx.message?.web_app_data?.data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      await ctx.reply(`✨ Спасибо за заказ!\n\n🛍 Сумма: ${data.totalAmount} ₽\n\nМы свяжемся с вами в ближайшее время.`);
      console.log(`Order received from user ${ctx.from.id}:`, data);
    } catch (error) {
      console.error('Error processing web app data:', error);
      await ctx.reply('Произошла ошибка при оформлении заказа. Попробуйте позже.');
    }
  }
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
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Start bot
    await bot.launch();
    console.log('Bot started successfully');

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