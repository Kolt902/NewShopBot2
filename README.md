# ESENTION Shop Bot

Telegram Mini App для магазина одежды ESENTION.

## Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер:
```bash
npm start
```

Для разработки используйте:
```bash
npm run dev
```

## Структура проекта

- `public/` - статические файлы
  - `index.html` - главная страница
  - `style.css` - стили
  - `app.js` - клиентский JavaScript
  - `products.json` - каталог товаров
  - `images/` - изображения товаров
- `server.js` - серверная часть
- `package.json` - зависимости проекта

## Конфигурация

- Порт: 3860
- Webhook URL: https://web-production-c2856.up.railway.app
- Bot Token: 6187617831:AAEI54IPnZ7e6yX2vmN6bHT3nQ4JThB6k

## Features

- Responsive web interface with a catalog of clothing items
- Shopping cart functionality
- Size selection for each item
- Order processing and notification system
- Integration with Telegram Bot API and Web App

## Prerequisites

- Node.js (v14 or higher)
- A Telegram Bot Token (get it from [@BotFather](https://t.me/botfather))
- A domain/URL for hosting the Web App

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd telegram-shop-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
BOT_TOKEN=your_telegram_bot_token
WEBAPP_URL=https://your-domain.com
ADMIN_CHAT_ID=your_telegram_chat_id
```

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Deployment to Render

1. Create a new Web Service on [Render](https://render.com)

2. Connect your GitHub repository

3. Configure the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     - `BOT_TOKEN`
     - `WEBAPP_URL`
     - `ADMIN_CHAT_ID`

4. Click "Create Web Service"

## Bot Setup

1. Talk to [@BotFather](https://t.me/botfather) on Telegram

2. Create a new bot or select an existing one

3. Set up the Web App URL:
   ```
   /setdomain
   ```
   Then select your bot and enter your domain (e.g., `your-app.onrender.com`)

4. Get your Admin Chat ID by:
   - Talking to [@userinfobot](https://t.me/userinfobot)
   - Using the ID in your `.env` file

## Usage

1. Start the bot by sending `/start`

2. Click the "Open Shop" button to launch the Web App

3. Browse items, select sizes, and add them to cart

4. Complete checkout to send the order

## File Structure

```
├── index.js           # Server setup and bot logic
├── public/            # Static files
│   ├── index.html    # Web App frontend
│   └── style.css     # Styling
├── orders.json       # Order storage
├── package.json      # Dependencies
└── .env             # Environment variables
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 