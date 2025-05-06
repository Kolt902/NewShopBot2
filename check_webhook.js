require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

async function checkAndDeleteWebhook() {
    try {
        // Get current webhook info
        const webhookInfo = await bot.telegram.getWebhookInfo();
        console.log('Current webhook info:', webhookInfo);

        // Delete any existing webhook
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        console.log('Webhook deleted successfully');

        // Get bot info
        const botInfo = await bot.telegram.getMe();
        console.log('Bot info:', botInfo);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndDeleteWebhook(); 