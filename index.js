require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

// Debug logging
console.log('Bot starting up...');
console.log('Bot token (first 5 chars):', process.env.BOT_TOKEN?.substring(0, 5));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('APP_URL:', process.env.APP_URL);

// Initialize bot and express app
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Additional debug logging for webhook mode
bot.telegram.getWebhookInfo().then(info => {
  console.log('Current webhook info:', info);
}).catch(err => {
  console.error('Error getting webhook info:', err);
});

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug endpoint to verify bot identity
app.get('/debug', async (req, res) => {
  try {
    const botInfo = await bot.telegram.getMe();
    res.json({
      bot: botInfo,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        APP_URL: process.env.APP_URL,
        PORT: process.env.PORT
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test command to verify bot identity
bot.command('testbot', async (ctx) => {
  try {
    const botInfo = await bot.telegram.getMe();
    await ctx.reply(
      `🔍 Bot Identity Check:\n` +
      `Bot ID: ${botInfo.id}\n` +
      `Bot Name: ${botInfo.first_name}\n` +
      `Username: @${botInfo.username}\n` +
      `Time: ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error('Test command error:', error);
    await ctx.reply('Error checking bot identity');
  }
});

// Strict command handling
bot.use((ctx, next) => {
  if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
    return; // Ignore non-command messages
  }
  return next();
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

// Handle category selections
bot.action(/^category_(.+)$/, async (ctx) => {
  try {
    const category = ctx.match[1];
    await ctx.answerCbQuery(); // Acknowledge the button press
    await ctx.reply(`Вы выбрали категорию: ${category}\nСкоро здесь появится каталог товаров!`);
  } catch (error) {
    console.error('Error in category selection:', error);
  }
});

bot.action(/^gender_(.+)$/, async (ctx) => {
  try {
    const gender = ctx.match[1];
    await ctx.answerCbQuery(); // Acknowledge the button press
    await ctx.reply(`Вы выбрали ${gender === 'men' ? 'мужскую' : 'женскую'} коллекцию\nСкоро здесь появится каталог товаров!`);
  } catch (error) {
    console.error('Error in gender selection:', error);
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// Start server and bot
const PORT = process.env.PORT || 3000;

// Production mode with webhook
if (process.env.NODE_ENV === 'production') {
  // Set webhook in production
  app.use(bot.webhookCallback('/webhook'));
  
  // Ensure webhook is set correctly
  bot.telegram.deleteWebhook()
    .then(() => bot.telegram.setWebhook(`${process.env.APP_URL}/webhook`))
    .then(() => {
      console.log('Webhook set:', `${process.env.APP_URL}/webhook`);
    })
    .catch((error) => {
      console.error('Webhook setup error:', error);
    });
} else {
  // Use polling in development
  bot.launch()
    .then(() => {
      console.log('Bot started in polling mode');
    })
    .catch((error) => {
      console.error('Bot launch error:', error);
    });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('App URL:', process.env.APP_URL);
}); 