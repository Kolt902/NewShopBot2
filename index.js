import express from 'express';
import { Telegraf } from 'telegraf';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for required environment variables
if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

if (!process.env.ADMIN_CHAT_ID) {
  throw new Error('ADMIN_CHAT_ID environment variable is required');
}

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/order', async (req, res) => {
  const order = req.body;
  console.log('New order:', order);
  
  try {
    // Send notification to Telegram
    await bot.telegram.sendMessage(
      process.env.ADMIN_CHAT_ID,
      `New Order:\n${JSON.stringify(order, null, 2)}`
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