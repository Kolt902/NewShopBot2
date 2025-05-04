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

// URL веб-приложения
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://newshopbot.onrender.com';
console.log('Web App URL:', WEBAPP_URL);

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Bot commands
bot.command('start', async (ctx) => {
  try {
    await ctx.reply('Добро пожаловать в наш магазин!', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Открыть магазин',
            web_app: { url: WEBAPP_URL }
          }
        ]]
      }
    });
    console.log('Start command processed successfully');
  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Извините, произошла ошибка. Попробуйте позже.');
  }
});

// Обработка данных от веб-приложения
bot.on('web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);
    console.log('Received web app data:', data);

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
  console.log('New order:', order);
  
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

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start bot
bot.launch().then(() => {
  console.log('Telegram bot started successfully');
}).catch(error => {
  console.error('Failed to start Telegram bot:', error);
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