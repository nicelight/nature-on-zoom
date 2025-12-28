# CONTEXT — Nature on Zoom

## Окружение

### Development
- OS: Windows (разработка)
- IDE: любой (VS Code рекомендуется)
- Node.js: для live-reload dev-сервера (опционально)

### Production
- VPS: ALma Linux
- SSL/TLS: Cloudflare (TLS 1.3)
- Web Server: nginx (рекомендуется)

## Технологический стек

### Frontend
| Технология | Версия | Назначение |
|------------|--------|------------|
| HTML5 | — | Структура страниц |
| CSS3 | — | Стилизация (пастельные цвета, анимации) |
| JavaScript | ES6+ | Интерактивность, WebSocket-клиент |
| SVG | — | Иконки и анимированные элементы |

### Backend (минимальный)
| Технология | Версия | Назначение |
|------------|--------|------------|
| Node.js | 18+ LTS | Runtime для WebSocket-сервера |
| ws | ^8.x | WebSocket-сервер |
| express | ^4.x | HTTP API для метаданных стримов |

## Команды

### Разработка
```bash
# Локальный сервер (Python)
python -m http.server 8000

# Или с live-reload (Node.js)
npx live-server --port=8000
```

### WebSocket-сервер (Node.js)
```bash
# Установка зависимостей
cd server && npm install

# Запуск (development)
npm run dev

# Запуск (production)
npm start
```

### Деплой
```bash
# Копирование на VPS
scp -r ./dist/* user@server:/var/www/nature-on-zoom/
```

## Quality Policy

### Код
- Чистый, читаемый HTML/CSS/JS
- Комментарии на английском
- Семантическая разметка

### Правдоподобность для DPI
- WebSocket heartbeat каждые 30 сек
- API-запросы метаданных стримов
- Реалистичные HTTP-заголовки
- Имитация HLS-подобных запросов

### Дизайн
- Пастельные/природные цвета
- Скруглённые углы (border-radius: 12-20px)
- Плавные CSS-анимации (transition: 0.3s ease)
- Анимированные SVG-иконки

## Структура проекта (планируемая)

```
/
├── index.html          # Главная страница (Watch)
├── charge.html         # Страница оплаты
├── css/
│   └── style.css       # Основные стили
├── js/
│   ├── main.js         # Основная логика
│   ├── oauth.js        # Имитация OAuth
│   ├── websocket.js    # WebSocket-клиент
│   └── payment.js      # Имитация оплаты
├── assets/
│   ├── svg/            # SVG-иконки
│   └── images/         # Превью гнёзд (TODO)
└── server/
    ├── package.json    # Зависимости Node.js
    ├── index.js        # Точка входа сервера
    ├── routes/
    │   └── api.js      # HTTP API routes
    └── ws/
        └── heartbeat.js # WebSocket handler
```

## Deprecation Policy
- Нет legacy-кода (новый проект)
