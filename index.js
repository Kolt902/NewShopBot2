require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

// Initialize bot and express app
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Bot commands
bot.command('start', async (ctx) => {
  try {
    await ctx.reply(
      '🌟 Добро пожаловать в ESENTION - премиальный магазин одежды!\n\n' +
      '🛍️ У нас вы найдете:\n' +
      '- Премиальную одежду\n' +
      '- Эксклюзивные коллекции\n' +
      '- Стильные образы\n\n' +
      'Выберите категорию:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎭 Old Money', callback_data: 'category_oldmoney' },
              { text: '🌆 Streetwear', callback_data: 'category_streetwear' }
            ],
            [
              { text: '✨ Luxury', callback_data: 'category_luxury' },
              { text: '🏃‍♂️ Sport', callback_data: 'category_sport' }
            ],
            [
              { text: '👔 Мужская коллекция', callback_data: 'gender_men' },
              { text: '👗 Женская коллекция', callback_data: 'gender_women' }
            ]
          ]
        }
      }
    );
  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

bot.command('help', async (ctx) => {
  try {
    await ctx.reply(
      '🛍️ *ESENTION Shop* - ваш премиальный магазин одежды\n\n' +
      '*Доступные команды:*\n' +
      '/start - Открыть главное меню\n' +
      '/help - Показать это сообщение\n\n' +
      '*Категории одежды:*\n' +
      '• Old Money - Элегантность и классика\n' +
      '• Streetwear - Современный уличный стиль\n' +
      '• Luxury - Премиальные коллекции\n' +
      '• Sport - Спортивная одежда',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error in help command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

// Handle category selections
bot.action(/^category_(.+)$/, async (ctx) => {
  const category = ctx.match[1];
  await ctx.reply(`Вы выбрали категорию: ${category}\nСкоро здесь появится каталог товаров!`);
});

bot.action(/^gender_(.+)$/, async (ctx) => {
  const gender = ctx.match[1];
  await ctx.reply(`Вы выбрали ${gender === 'men' ? 'мужскую' : 'женскую'} коллекцию\nСкоро здесь появится каталог товаров!`);
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
});

// Start server and bot
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  // Set webhook in production
  app.use(bot.webhookCallback('/webhook'));
  bot.telegram.setWebhook(`${process.env.APP_URL}/webhook`).then(() => {
    console.log('Webhook set:', `${process.env.APP_URL}/webhook`);
  });
} else {
  // Use polling in development
  bot.launch().then(() => {
    console.log('Bot started in polling mode');
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('App URL:', process.env.APP_URL);
}); 