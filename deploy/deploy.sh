#!/bin/bash
# Yangilanishlarni serverga qo'llash uchun skript.
# Server ichida loyiha papkasida ishga tushiring: bash deploy/deploy.sh

set -e

echo "==> GitHub'dan yangi kodni olish..."
git pull origin main

echo "==> Paketlarni o'rnatish..."
npm install --production=false

echo "==> Build qilish..."
npm run build

echo "==> PM2 orqali qayta ishga tushirish..."
pm2 restart sales-dashboard || pm2 start deploy/ecosystem.config.js

echo "==> Tayyor! Holatni tekshirish uchun: pm2 status"
