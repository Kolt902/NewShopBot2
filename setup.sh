#!/bin/bash

# Обновление системы
apt update && apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Установка PM2
npm install -g pm2

# Создание директории приложения
mkdir -p /var/www/esention-bot
cd /var/www/esention-bot

# Клонирование репозитория
git clone git@github.com:your-username/NewShopBot.git .

# Установка зависимостей
npm install --production

# Запуск приложения через PM2
pm2 start ecosystem.config.js

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска PM2 