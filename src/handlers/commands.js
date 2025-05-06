import { Markup } from 'telegraf';

export const commands = {
  async start(ctx) {
    try {
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('🎭 Old Money', 'category_oldmoney'),
          Markup.button.callback('🌆 Streetwear', 'category_streetwear')
        ],
        [
          Markup.button.callback('✨ Luxury', 'category_luxury'),
          Markup.button.callback('🏃‍♂️ Sport', 'category_sport')
        ],
        [
          Markup.button.callback('👔 Мужская коллекция', 'gender_men'),
          Markup.button.callback('👗 Женская коллекция', 'gender_women')
        ],
        [Markup.button.callback('🛍 Каталог', 'open_catalog')]
      ]);

      await ctx.reply(
        '🌟 Добро пожаловать в ESENTION - премиальный магазин одежды!\n\n' +
        '🛍️ У нас вы найдете:\n' +
        '- Премиальную одежду\n' +
        '- Эксклюзивные коллекции\n' +
        '- Стильные образы\n\n' +
        'Выберите категорию:',
        keyboard
      );
    } catch (error) {
      console.error('Error in start command:', error);
      await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  },

  async help(ctx) {
    try {
      await ctx.reply(
        '🛍️ *ESENTION Shop* - ваш премиальный магазин одежды\n\n' +
        '*Доступные команды:*\n' +
        '/start - Открыть главное меню\n' +
        '/catalog - Открыть каталог\n' +
        '/help - Показать это сообщение\n\n' +
        '*Категории одежды:*\n' +
        '• Old Money - Элегантность и классика\n' +
        '• Streetwear - Современный уличный стиль\n' +
        '• Luxury - Премиальные коллекции\n' +
        '• Sport - Спортивная одежда\n\n' +
        'Для совершения покупки выберите категорию в меню.',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error in help command:', error);
      await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  },

  async catalog(ctx) {
    try {
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('🎭 Old Money', 'category_oldmoney'),
          Markup.button.callback('🌆 Streetwear', 'category_streetwear')
        ],
        [
          Markup.button.callback('✨ Luxury', 'category_luxury'),
          Markup.button.callback('🏃‍♂️ Sport', 'category_sport')
        ]
      ]);

      await ctx.reply('Выберите категорию:', keyboard);
    } catch (error) {
      console.error('Error in catalog command:', error);
      await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  }
}; 