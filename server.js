const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 3860;

// Bot configuration
const token = '6187617831:AAEI54IPnZ7e6yX2vmN6bHT3nQ4JThB6k';
const bot = new TelegramBot(token, { webHook: { port } });

// Serve static files with no caching
app.use(express.static('public', {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Webhook setup
const url = 'https://web-production-c2856.up.railway.app';
bot.setWebHook(`${url}/bot${token}`);

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
  });
});

// Handle category selection
bot.on('callback_query', (query) => {
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
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 