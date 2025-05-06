import { logger } from '../config/logger.js';

export const startCommand = async (ctx) => {
  try {
    const webAppUrl = ctx.config.APP_URL.replace(/\/$/, '');
    
    await ctx.reply('🌟 Добро пожаловать в ESENTION - премиальный магазин одежды!', {
      parse_mode: 'HTML',
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

export const handleWebAppData = async (ctx) => {
  if (ctx.message?.web_app_data?.data) {
    try {
      const data = JSON.parse(ctx.message.web_app_data.data);
      await ctx.reply(`✨ Спасибо за заказ!\n\n🛍 Сумма: ${data.totalAmount} ₽\n\nМы свяжемся с вами в ближайшее время.`);
      logger.info(`Order received from user ${ctx.from.id}:`, data);
    } catch (error) {
      logger.error('Error processing web app data:', error);
      await ctx.reply('Произошла ошибка при оформлении заказа. Попробуйте позже.');
    }
  }
}; 