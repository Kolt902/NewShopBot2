const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3860;

// Middleware
app.use(cors());
app.use(express.json());

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Bot configuration
const token = process.env.BOT_TOKEN || '8167818831:AAEIS41PNZ7eE0y2X6mV68HT3UmQ4JTwB6k';
const url = process.env.WEBAPP_URL || 'https://web-production-c2856.up.railway.app';

let bot;
try {
  bot = new TelegramBot(token, { webHook: { port } });
  bot.setWebHook(`${url}/bot${token}`);
} catch (error) {
  console.error('Error initializing bot:', error);
  process.exit(1);
}

// Serve static files with no caching
app.use(express.static('public', {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Bot commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Добро пожаловать в ESENTION! 👋\n\nВыберите категорию:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🎩 Old Money', callback_data: 'category_oldmoney' },
          { text: '👕 Streetwear', callback_data: 'category_streetwear' }
        ],
        [
          { text: '💎 Luxury', callback_data: 'category_luxury' },
          { text: '🏃‍♂️ Sport', callback_data: 'category_sport' }
        ],
        [
          { text: '👨 Мужчинам', callback_data: 'gender_men' },
          { text: '👩 Женщинам', callback_data: 'gender_women' }
        ],
        [{
          text: '🛍 Открыть каталог',
          web_app: { url: `${url}/index.html` }
        }]
      ]
    }
  }).catch(error => {
    console.error('Error sending start message:', error);
  });
});

// Handle category selection
bot.on('callback_query', (query) => {
  try {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('category_')) {
      const category = data.split('_')[1];
      bot.sendMessage(chatId, `Открываю каталог ${category}`, {
        reply_markup: {
          inline_keyboard: [[{
            text: '🛍 Смотреть товары',
            web_app: { url: `${url}/index.html?category=${category}` }
          }]]
        }
      });
    } else if (data.startsWith('gender_')) {
      const gender = data.split('_')[1];
      bot.sendMessage(chatId, `Открываю раздел ${gender === 'men' ? 'мужской' : 'женской'} одежды`, {
        reply_markup: {
          inline_keyboard: [[{
            text: '🛍 Смотреть товары',
            web_app: { url: `${url}/index.html?gender=${gender}` }
          }]]
        }
      });
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
}); 