const { Telegraf } = require('telegraf');

const bot = new Telegraf('8167818831:AAHN2wZJEExK1AwsatQH3o2XNw-DRAMUvvk');

bot.command('start', (ctx) => ctx.reply('Тест'));

bot.launch()
  .then(() => console.log('Бот запущен'))
  .catch((error) => console.error('Ошибка:', error)); 