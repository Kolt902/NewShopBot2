# ESENTION Shop Bot

Telegram бот для премиального магазина одежды ESENTION с веб-приложением.

## Функциональность

- Интеграция с Telegram Web App
- Каталог товаров с категориями
- Фильтрация по стилям (Old Money, Streetwear, Luxury, Sport)
- Корзина и оформление заказов
- Адаптивный дизайн

## Технологии

- Node.js
- Express.js
- Telegraf
- Railway для деплоя

## Переменные окружения

```env
BOT_TOKEN=your_telegram_bot_token
APP_URL=your_railway_app_url
PORT=3000
WEBHOOK_PATH=/webhook
NODE_ENV=production
```

## Установка и запуск

1. Клонировать репозиторий:
```bash
git clone https://github.com/Kolt902/NewShopBot2.git
cd NewShopBot2
```

2. Установить зависимости:
```bash
npm install
```

3. Создать файл .env и заполнить переменные окружения

4. Запустить приложение:
```bash
npm start
```

## Деплой

Проект настроен для автоматического деплоя на Railway.
При пуше в main ветку происходит автоматический деплой.

## Структура проекта

```
├── src/
│   ├── config/         # Конфигурация
│   ├── handlers/       # Обработчики команд
│   ├── middleware/     # Middleware
│   └── index.js        # Точка входа
├── public/             # Статические файлы
│   ├── index.html
│   ├── style.css
│   └── app.js
└── package.json
```