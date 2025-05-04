require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

// Загрузка и проверка переменных окружения
const config = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID,
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.NODE_ENV === 'production' 
    ? (process.env.RAILWAY_STATIC_URL || process.env.WEBHOOK_URL)
    : 'http://localhost:3000'
};

// Проверка обязательных переменных
if (!config.BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

if (!config.ADMIN_CHAT_ID) {
  console.warn('Warning: ADMIN_CHAT_ID is not set. Admin notifications will be disabled.');
}

// Инициализация приложения
const app = express();
const bot = new Telegraf(config.BOT_TOKEN);

// Логирование конфигурации
console.log('Initialization - Environment:', config.NODE_ENV);
console.log('Initialization - App URL:', config.APP_URL);
console.log('Initialization - Bot Token:', config.BOT_TOKEN ? 'Present' : 'Missing');
console.log('Initialization - Admin Chat ID:', config.ADMIN_CHAT_ID || 'Not set');
console.log('Initialization - Port:', config.PORT);

// Middleware для логирования
bot.use((ctx, next) => {
  console.log('New bot update:', {
    updateType: ctx.updateType,
    updateSubType: ctx.updateSubTypes?.[0],
    from: ctx.from?.id,
    text: ctx.message?.text
  });
  return next();
});

// Middleware Express
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Bot commands
bot.command('start', async (ctx) => {
  console.log('Start command received from:', ctx.from.id);
  try {
    console.log('Sending welcome message...');
    const result = await ctx.reply('Добро пожаловать в наш магазин!', {
      reply_markup: {
        keyboard: [
          [{ text: 'Открыть каталог' }]
        ],
        resize_keyboard: true
      }
    });
    console.log('Welcome message sent successfully:', result);
  } catch (error) {
    console.error('Error in start command:', error);
    try {
      await ctx.reply('Извините, произошла ошибка. Попробуйте позже.');
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  if (ctx.message.text === 'Открыть каталог') {
    await ctx.reply('В режиме разработки каталог недоступен. Используйте production версию для доступа к веб-приложению.');
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка заказов
app.post('/order', async (req, res) => {
  const order = req.body;
  console.log('New order received:', order);
  
  try {
    if (!config.ADMIN_CHAT_ID) {
      throw new Error('Admin chat ID not configured');
    }

    const orderItems = order.items.map(item => 
      `• ${item.title} (размер: ${item.size}) - ${item.price} ₽`
    ).join('\n');

    const message = `
🛍 Новый заказ!

Товары:
${orderItems}

💰 Итого: ${order.total} ₽
`;

    await bot.telegram.sendMessage(
      config.ADMIN_CHAT_ID,
      message,
      { parse_mode: 'HTML' }
    );

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to process order. Please try again later.' 
    });
  }
});

// Запуск сервера
const server = app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

// Запуск бота в режиме polling для разработки
console.log('Starting bot in polling mode...');
bot.launch()
  .then(() => {
    console.log('Bot successfully started in polling mode');
  })
  .catch(error => {
    console.error('Failed to start bot:', error);
    process.exit(1);
  });

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('Shutting down...');
  bot.stop('SIGINT');
  server.close();
});

process.once('SIGTERM', () => {
  console.log('Shutting down...');
  bot.stop('SIGTERM');
  server.close();
});