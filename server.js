const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN || '8167818831:AAEIS41PNZ7eE0y2X6mV68HT3UmQ4JTwB6k';
const url = process.env.APP_URL || 'https://web-production-c2856.up.railway.app';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Create bot instance
const bot = new TelegramBot(token, { webHook: { port } });

// Set webhook
bot.setWebHook(`${url}/bot${token}`);

// Welcome message and main menu
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 'Добро пожаловать в ESENTION! 🛍\n\nВыберите категорию:', {
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
          web_app: { url: `${url}` }
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
    bot.sendMessage(chatId, `Выбрана категория: ${category}`, {
      reply_markup: {
        inline_keyboard: [[{
          text: '🛍 Смотреть товары',
          web_app: { url: `${url}?category=${category}` }
        }]]
      }
    });
  } else if (data.startsWith('gender_')) {
    const gender = data.split('_')[1];
    const genderText = gender === 'men' ? 'мужской' : 'женской';
    bot.sendMessage(chatId, `Выбран раздел ${genderText} одежды`, {
      reply_markup: {
        inline_keyboard: [[{
          text: '🛍 Смотреть товары',
          web_app: { url: `${url}?gender=${gender}` }
        }]]
      }
    });
  }
});

// Handle web app data
app.post(`/bot${token}`, (req, res) => {
  const { queryId, products, totalAmount } = req.body;
  
  // Process the order
  bot.answerWebAppQuery(queryId, {
    type: 'article',
    id: queryId,
    title: 'Заказ оформлен',
    input_message_content: {
      message_text: `Заказ на сумму ${totalAmount} ₽ успешно оформлен!`
    }
  }).catch(console.error);
  
  res.sendStatus(200);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 