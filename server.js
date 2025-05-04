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
  bot.sendMessage(chatId, 'Добро пожаловать в ESENTION!', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '🛍 Открыть каталог',
          web_app: { url: `${url}/index.html` }
        }]
      ]
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 