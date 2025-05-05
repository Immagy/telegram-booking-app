# Telegram Mini App - Booking System

Приложение для бронирования консультаций через Telegram Mini App. Позволяет пользователям просматривать доступные слоты времени, бронировать встречи и оплачивать их через Telegram.

## Функциональность

- Просмотр доступных слотов времени
- Бронирование консультаций
- Интеграция с Google Calendar
- Оплата через Telegram
- Проверка доступности слотов в реальном времени
- Навигация с кнопкой "Назад"

## Технологии

- React
- TypeScript
- Vite
- Tailwind CSS
- Telegram Mini App API
- Google Calendar API

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Immagy/telegram-booking-app.git
cd telegram-booking-app
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл .env и добавьте необходимые переменные окружения:
```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_GOOGLE_CALENDAR_API_KEY=your_google_api_key
```

4. Запустите приложение в режиме разработки:
```bash
npm run dev
```

## Настройка Telegram Bot

1. Создайте нового бота через @BotFather
2. Включите поддержку Mini Apps
3. Добавьте URL вашего приложения в настройки бота
4. Получите токен бота и добавьте его в .env файл

## Настройка Google Calendar API

1. Создайте проект в Google Cloud Console
2. Включите Google Calendar API
3. Создайте учетные данные API
4. Добавьте API ключ в .env файл

## Деплой

Приложение автоматически деплоится на GitHub Pages при пуше в ветку main. Для настройки деплоя:

1. Включите GitHub Pages в настройках репозитория
2. Добавьте секреты в настройках репозитория:
   - `TELEGRAM_BOT_TOKEN`
   - `GOOGLE_CALENDAR_API_KEY`

После деплоя приложение будет доступно по адресу:
https://immagy.github.io/telegram-booking-app/

## Разработка

1. Создайте новую ветку для ваших изменений:
```bash
git checkout -b feature/your-feature-name
```

2. Внесите изменения и создайте коммит:
```bash
git add .
git commit -m "Add your feature"
```

3. Отправьте изменения в репозиторий:
```bash
git push origin feature/your-feature-name
```

4. Создайте Pull Request в ветку main

## Лицензия

MIT 