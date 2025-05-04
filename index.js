const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');

// Check for required environment variables
if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

if (!process.env.ADMIN_CHAT_ID) {
  throw new Error('ADMIN_CHAT_ID environment variable is required');
}

// Определяем URL приложения
const APP_URL = process.env.RAILWAY_STATIC_URL || 'http://localhost:3000';
const BOT_TOKEN = process.env.BOT_TOKEN;
console.log('Initialization - App URL:', APP_URL);
console.log('Initialization - Bot Token:', BOT_TOKEN ? 'Present' : 'Missing');
console.log('Initialization - Admin Chat ID:', process.env.ADMIN_CHAT_ID);

const app = express();
const bot = new Telegraf(BOT_TOKEN);

// Middleware для логирования всех обновлений
bot.use((ctx, next) => {
  console.log('New bot update:', {
    updateType: ctx.updateType,
    updateSubType: ctx.updateSubTypes?.[0],
    from: ctx.from?.id,
    text: ctx.message?.text
  });
  return next();
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Bot commands
bot.command('start', async (ctx) => {
  console.log('Start command received from:', ctx.from.id);
  try {
    console.log('Sending welcome message with web app button...');
    const result = await ctx.reply('Добро пожаловать в наш магазин!', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Открыть магазин',
            web_app: { url: APP_URL }
          }
        ]]
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

// Обработка данных от веб-приложения
bot.on('web_app_data', async (ctx) => {
  console.log('Received web_app_data event');
  try {
    const data = JSON.parse(ctx.webAppData.data);
    console.log('Parsed web app data:', data);

    // Формируем сообщение о заказе
    const orderItems = data.items.map(item => 
      `• ${item.title} (размер: ${item.size}) - ${item.price} ₽`
    ).join('\n');

    const message = `
🛍 Новый заказ!

Товары:
${orderItems}

💰 Итого: ${data.total} ₽
`;

    // Отправляем подтверждение пользователю
    await ctx.reply('Спасибо за заказ! Мы свяжемся с вами в ближайшее время.');
    
    // Отправляем информацию администратору
    await bot.telegram.sendMessage(
      process.env.ADMIN_CHAT_ID,
      message,
      { parse_mode: 'HTML' }
    );

  } catch (error) {
    console.error('Error processing web app data:', error);
    await ctx.reply('Извините, произошла ошибка при обработке заказа. Попробуйте позже.');
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/order', async (req, res) => {
  const order = req.body;
  console.log('New order received:', order);
  
  try {
    // Формируем красивое сообщение о заказе
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
      process.env.ADMIN_CHAT_ID,
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

// Настройка вебхука для Telegram
const secretPath = `/webhook/${BOT_TOKEN}`;
app.use(bot.webhookCallback(secretPath));

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Set webhook
const webhookUrl = `${APP_URL}${secretPath}`;
bot.telegram.setWebhook(webhookUrl).then(() => {
  console.log('Webhook set to:', webhookUrl);
}).catch(error => {
  console.error('Failed to set webhook:', error);
  process.exit(1);
});

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  server.close();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  server.close();
});