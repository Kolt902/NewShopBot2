import { logger } from '../config/logger.js';

export const startCommand = async (ctx) => {
  try {
    const webAppUrl = ctx.config.APP_URL.replace(/\/$/, '');
    
    await ctx.reply('👋 Добро пожаловать в ESENTION!\n\n🛍️ У нас вы найдете:\n- Премиальную одежду\n- Эксклюзивные коллекции\n- Стильные образы\n\nВыберите категорию:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎭 Old Money', web_app: { url: `${webAppUrl}?category=oldmoney` } },
            { text: '🌆 Streetwear', web_app: { url: `${webAppUrl}?category=streetwear` } }
          ],
          [
            { text: '✨ Luxury', web_app: { url: `${webAppUrl}?category=luxury` } },
            { text: '🏃‍♂️ Sport', web_app: { url: `${webAppUrl}?category=sport` } }
          ],
          [
            { text: '👔 Мужская коллекция', web_app: { url: `${webAppUrl}?gender=men` } },
            { text: '👗 Женская коллекция', web_app: { url: `${webAppUrl}?gender=women` } }
          ],
          [{
            text: '🛍 Открыть каталог',
            web_app: { url: webAppUrl }
          }]
        ]
      }
    });
    logger.info(`Start command handled for user ${ctx.from.id}, using URL: ${webAppUrl}`);
  } catch (error) {
    logger.error('Error in /start command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
};

export const helpCommand = async (ctx) => {
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
      'Для совершения покупки выберите категорию в меню и добавьте товары в корзину.',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    logger.error('Error in /help command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
};

export const catalogCommand = async (ctx) => {
  try {
    const webAppUrl = ctx.config.APP_URL.replace(/\/$/, '');
    await ctx.reply('Выберите категорию:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎭 Old Money', web_app: { url: `${webAppUrl}?category=oldmoney` } },
            { text: '🌆 Streetwear', web_app: { url: `${webAppUrl}?category=streetwear` } }
          ],
          [
            { text: '✨ Luxury', web_app: { url: `${webAppUrl}?category=luxury` } },
            { text: '🏃‍♂️ Sport', web_app: { url: `${webAppUrl}?category=sport` } }
          ]
        ]
      }
    });
  } catch (error) {
    logger.error('Error in /catalog command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
};

export const handleWebAppData = async (ctx) => {
  if (ctx.message?.web_app_data?.data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      await ctx.reply(
        '✨ Спасибо за заказ!\n\n' +
        `🛍 Сумма заказа: ${data.totalAmount} ₽\n\n` +
        'Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа и уточнения деталей доставки.',
        { parse_mode: 'HTML' }
      );
      logger.info(`Order received from user ${ctx.from.id}:`, data);
    } catch (error) {
      logger.error('Error processing web app data:', error);
      await ctx.reply('Произошла ошибка при оформлении заказа. Попробуйте позже.');
    }
  }
}; 