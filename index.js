require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const path = require('path');
const cors = require('cors');

// Конфигурация
const config = {
  BOT_TOKEN: '6187617831:AAEI54IPnZ7e6yX2vmN6bHT3nQ4JThB6k',
  PORT: 3860
};

const WEB_APP_URL = 'https://web-production-c2856.up.railway.app';

// Инициализация
const app = express();
const bot = new Telegraf(config.BOT_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    bot_info: {
      webhook_url: config.WEBHOOK_URL,
      web_app_url: WEB_APP_URL,
      port: config.PORT
    }
  });
});

// Команда /start
bot.command('start', async (ctx) => {
  try {
    const welcomeMessage = `
🎉 *Добро пожаловать в ESENTION!*

Мы рады представить вам нашу коллекцию одежды:

*👔 Old Money*
Элегантность и утонченность в каждой детали

*🧢 Streetwear*
Современный уличный стиль для ярких личностей

*💎 Luxury*
Премиальные бренды для особых случаев

*🏃‍♂️ Sport*
Комфортная спортивная одежда

*🎁 АКЦИЯ:*
Скидка 10% на первую покупку!
`;

    await ctx.replyWithMarkdown(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [{ 
            text: '🛍 Открыть магазин', 
            web_app: { url: WEB_APP_URL } 
          }]
        ]
      }
    });
  } catch (error) {
    console.error('Ошибка:', error);
    await ctx.reply('Извините, произошла ошибка. Попробуйте позже.');
  }
});

// Обработка данных от Web App
bot.on('message', async (ctx) => {
  try {
    const webAppData = ctx.message?.web_app_data?.data;
    if (!webAppData) return;

    const data = JSON.parse(webAppData);
    if (data.type === 'checkout') {
      const items = data.items.map(item => 
        `• ${item.name} (${item.selectedSize}) - ${item.price}`
      ).join('\n');

      await ctx.reply(
        `🛍 Ваш заказ:\n\n${items}\n\nСпасибо за покупку! Мы свяжемся с вами для подтверждения заказа.`,
        { parse_mode: 'HTML' }
      );

      // Отправка уведомления администратору
      if (config.ADMIN_CHAT_ID) {
        await bot.telegram.sendMessage(
          config.ADMIN_CHAT_ID,
          `🛍 Новый заказ!\n\nПользователь: ${ctx.from.first_name} ${ctx.from.last_name || ''} (@${ctx.from.username || 'нет username'})\n\n${items}`,
          { parse_mode: 'HTML' }
        );
      }
    }
  } catch (error) {
    console.error('Web App data processing error:', error);
    await ctx.reply('Извините, произошла ошибка при обработке заказа.');
  }
});

// Обработка заказов
app.post('/order', async (req, res) => {
  try {
    const order = req.body;
    const items = order.items.map(item => 
      `• ${item.title} (${item.size}) - ${item.price} ₽`
    ).join('\n');

    await bot.telegram.sendMessage(config.ADMIN_CHAT_ID, 
      `🛍 Новый заказ!\n\n${items}\n\n💰 Итого: ${order.total} ₽`,
      { parse_mode: 'HTML' }
    );
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка ошибок бота
bot.catch((err, ctx) => {
  console.error('Ошибка бота:', err);
  ctx.reply('Произошла ошибка при обработке команды');
});

// Запускаем бота
bot.launch()
  .then(() => {
    console.log('Бот успешно запущен');
    
    // Запускаем веб-сервер
    app.listen(config.PORT, '0.0.0.0', () => {
      console.log(`Веб-сервер запущен на порту ${config.PORT}`);
      console.log(`Web App URL: ${WEB_APP_URL}`);
    });
  })
  .catch((error) => {
    console.error('Ошибка при запуске бота:', error);
    process.exit(1);
  });

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));