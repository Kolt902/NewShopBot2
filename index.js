import express from 'express';
import { Telegraf } from 'telegraf';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN || '8167818831:AAEIS41PNZ7eE0y2X6mV68HT3UmQ4JTwB6k');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/order', (req, res) => {
  const order = req.body;
  console.log('Новый заказ:', order);
  
  try {
    // Сохраняем заказ в файл
    const orders = fs.existsSync('orders.json') ? JSON.parse(fs.readFileSync('orders.json')) : [];
    orders.push({
      ...order,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));

    // Отправляем уведомление в Telegram
    bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID || 'Y@illia2323', 
      `Новый заказ:\n${JSON.stringify(order, null, 2)}`
    );

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Ошибка при обработке заказа:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

// Запуск бота
bot.launch();

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));