require('dotenv').config();
const { Telegraf } = require('telegraf');

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Логируем информацию о запуске
console.log('Starting bot in development mode...');
console.log('Bot token (first 5 chars):', process.env.BOT_TOKEN?.substring(0, 5));

// Простая команда для проверки
bot.command('start', async (ctx) => {
    console.log('Received start command from:', ctx.from.id);
    await ctx.reply('🔄 Тестовый запуск ESENTION бота');
});

// Эхо для всех текстовых сообщений
bot.on('text', async (ctx) => {
    console.log('Received message:', ctx.message.text);
    console.log('From user:', ctx.from.id);
    await ctx.reply(`Эхо: ${ctx.message.text}`);
});

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error('Bot error:', err);
});

// Запускаем бота
bot.launch()
    .then(() => {
        console.log('Bot successfully started in polling mode');
    })
    .catch((error) => {
        console.error('Failed to start bot:', error);
    });

// Включаем graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 