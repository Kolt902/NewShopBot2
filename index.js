require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

// Initialize bot and express app
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Debug logging
console.log('Starting bot with config:', {
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  BOT_TOKEN_PREFIX: process.env.BOT_TOKEN?.substring(0, 10)
});

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasToken: !!process.env.BOT_TOKEN
  });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  try {
    bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook Error');
  }
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
  console.log('Received update:', {
    type: ctx.updateType,
    from: ctx.from?.id,
    text: ctx.message?.text
  });
  
  if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
    console.log('Ignoring non-command message');
    return;
  }
  return next();
});

// Bot commands
bot.command('start', async (ctx) => {
  try {
    console.log('Processing /start command from:', ctx.from.id);
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
    console.log('Successfully sent start message');
  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

// Handle button clicks
bot.action(/.+/, async (ctx) => {
  try {
    await ctx.answerCbQuery();
    await ctx.reply('Скоро здесь появится каталог товаров!');
  } catch (error) {
    console.error('Error in button handler:', error);
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// Start server and bot
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  console.log('Starting bot in production mode');
  
  // Set webhook
  const webhookUrl = `${process.env.APP_URL}/webhook`;
  bot.telegram.setWebhook(webhookUrl)
    .then(() => {
      console.log('Webhook set:', webhookUrl);
      app.listen(PORT, () => {
        console.log('Webhook server started on port', PORT);
      });
    })
    .catch(error => {
      console.error('Failed to set webhook:', error);
      process.exit(1);
    });
} else {
  console.log('Starting bot in development mode');
  bot.launch()
    .then(() => {
      console.log('Bot started in polling mode');
      app.listen(PORT, () => {
        console.log('Development server started on port', PORT);
      });
    })
    .catch(error => {
      console.error('Bot launch error:', error);
      process.exit(1);
    });
}

// Enable graceful stop
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  process.exit(0);
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  process.exit(0);
}); 