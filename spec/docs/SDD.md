# Software Design Document (SDD)
# Nature on Zoom — Архитектура

**Версия:** 1.0.0  
**Дата:** 2025-12-28  
**Статус:** Draft

---

## 1. Обзор архитектуры

### 1.1 Высокоуровневая диаграмма

```
┌─────────────────────────────────────────────────────────────────────┐
│                           КЛИЕНТ (Браузер)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────────────┐   │
│  │ index.html  │   │ charge.html │   │      JavaScript         │   │
│  │  (Watch)    │   │  (Charge)   │   │  ┌─────────────────┐    │   │
│  └─────────────┘   └─────────────┘   │  │    main.js      │    │   │
│                                       │  │    oauth.js     │    │   │
│  ┌────────────────────────────────┐  │  │    payment.js   │    │   │
│  │          style.css             │  │  │    websocket.js │    │   │
│  │    (дизайн-система, анимации)  │  │  └─────────────────┘    │   │
│  └────────────────────────────────┘  └─────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SVG Assets + Images                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                    │                        │
                    │ HTTP/2 + TLS 1.3       │ WebSocket
                    ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          CLOUDFLARE                                  │
│                     (SSL Termination, CDN)                          │
└─────────────────────────────────────────────────────────────────────┘
                    │                        │
                    ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VPS (ALma Linux)                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────┐   ┌─────────────────────────────────┐ │
│  │        nginx            │   │      WebSocket Server           │ │
│  │   (Static Files)        │   │      (Node.js + ws + express)   │ │
│  │                         │   │                                 │ │
│  │  - /                    │   │  - /ws/heartbeat                │ │
│  │  - /charge.html         │   │  - /api/stream/preview/{id}     │ │
│  │  - /css/*               │   │                                 │ │
│  │  - /js/*                │   └─────────────────────────────────┘ │
│  │  - /assets/*            │                                       │
│  └─────────────────────────┘                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Компоненты

| Компонент | Технология | Назначение |
|-----------|------------|------------|
| Frontend | HTML/CSS/JS | UI, анимации, OAuth-модал |
| WebSocket Client | JavaScript | Heartbeat, метаданные стримов |
| nginx | nginx | Статические файлы |
| WebSocket Server | Node.js (ws + express) | Heartbeat, fake API |

---

## 2. Frontend-архитектура

### 2.1 Структура файлов

```
/var/www/nature-on-zoom/
├── index.html              # Главная страница (Watch)
├── charge.html             # Страница оплаты
├── css/
│   ├── style.css           # Основные стили
│   ├── variables.css       # CSS-переменные (цвета, размеры)
│   ├── animations.css      # Keyframe-анимации
│   └── components.css      # Стили компонентов
├── js/
│   ├── main.js             # Точка входа, инициализация
│   ├── oauth.js            # Модальное окно OAuth
│   ├── payment.js          # Логика формы оплаты
│   ├── websocket.js        # WebSocket-клиент
│   └── config.js           # Конфигурация (endpoints, данные фреймов)
└── assets/
    ├── svg/
    │   ├── logo.svg        # Логотип
    │   ├── icon-watch.svg  # Иконка меню Watch
    │   ├── icon-charge.svg # Иконка меню Charge
    │   ├── icon-check.svg  # Иконка меню Check
    │   ├── icon-play.svg   # Кнопка Play
    │   ├── icon-google.svg # Логотип Google
    │   └── icon-lock.svg   # Иконка замка (оплата)
    └── images/
        └── (TODO: превью гнёзд)
```

### 2.2 Модули JavaScript

#### main.js
```javascript
// Инициализация приложения
// - Загрузка данных фреймов
// - Рендеринг UI
// - Инициализация WebSocket
// - Привязка обработчиков событий
```

#### oauth.js
```javascript
// Модальное окно OAuth
// - showOAuthModal(streamId)
// - hideOAuthModal()
// - handleOAuthSubmit() → редирект на charge.html
```

#### payment.js
```javascript
// Форма оплаты
// - Валидация полей
// - Форматирование номера карты
// - handlePayment() → редирект на index.html
```

#### websocket.js
```javascript
// WebSocket-клиент
// - connect()
// - sendPing()
// - onMessage()
// - fetchStreamPreview(id)
```

#### config.js
```javascript
// Конфигурация
const CONFIG = {
  WS_URL: 'wss://natureonzoom.win/ws/heartbeat',
  API_URL: 'https://natureonzoom.win/api',
  HEARTBEAT_INTERVAL: 30000, // 30 сек
  STREAMS: [
    { id: 'eagle', title: 'Bald Eagle Nest', ... },
    // ... 8 стримов
  ]
};
```

### 2.3 CSS-архитектура

Используется методология **CSS Layers** для организации стилей:

```css
@layer reset, base, components, utilities;

@layer reset {
  /* Normalize/reset */
}

@layer base {
  /* Типографика, цвета, основные элементы */
}

@layer components {
  /* .card, .button, .modal, .nav, .form */
}

@layer utilities {
  /* .mt-1, .text-center, etc. (минимально) */
}
```

---

## 3. Backend-архитектура

### 3.1 WebSocket-сервер (Node.js)

**Технология:** Node.js 18+ LTS с библиотеками `ws` и `express`  
**Решение:** [ADR-0001](../adr/ADR-0001.md) — выбран Node.js за производительность

#### Структура сервера

```
server/
├── package.json          # Зависимости
├── index.js              # Точка входа
├── routes/
│   └── api.js            # HTTP API routes
└── ws/
    └── heartbeat.js      # WebSocket handler
```

#### package.json
```json
{
  "name": "nature-on-zoom-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "ws": "^8.14.0"
  }
}
```

#### Endpoints

**WebSocket: `/ws/heartbeat`**
```
Client → Server: { "type": "ping", "timestamp": 1703800000 }
Server → Client: { "type": "pong", "timestamp": 1703800000 }
```

**HTTP: `GET /api/stream/preview/{id}`**
```json
{
  "id": "eagle",
  "title": "Bald Eagle Nest",
  "status": "live",
  "viewers": 142,
  "quality": "1080p",
  "bitrate": "4500kbps",
  "thumbnail": "/assets/images/eagle-thumb.jpg"
}
```

### 3.2 nginx-конфигурация

```nginx
server {
    listen 80;
    server_name natureonzoom.win;
    
    # Cloudflare handles SSL, но можно добавить
    # listen 443 ssl; ...
    
    root /var/www/nature-on-zoom;
    index index.html;
    
    # Статические файлы
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # WebSocket proxy
    location /ws/ {
        proxy_pass http://127.0.0.1:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8765;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Кэширование статики
    location ~* \.(css|js|svg|png|jpg|jpeg|webp)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 4. Потоки данных

### 4.1 Просмотр главной страницы

```
┌─────────┐     GET /           ┌─────────┐
│ Browser │ ──────────────────► │  nginx  │
└─────────┘                     └────┬────┘
                                     │
     ◄───────────────────────────────┘
     index.html + CSS + JS
     
     После загрузки:
     
┌─────────┐   WebSocket connect   ┌─────────┐
│   JS    │ ────────────────────► │   WS    │
│ client  │                       │ server  │
└─────────┘                       └─────────┘
     │              ping/pong          │
     │◄──────────────────────────────►│
     │          (каждые 30 сек)        │
```

### 4.2 Клик на Play

```
┌─────────┐   click Play   ┌────────────┐
│ Frame   │ ─────────────► │ OAuth      │
│         │                │ Modal      │
└─────────┘                └─────┬──────┘
                                 │
                                 │ click "Continue"
                                 ▼
                    window.location = '/charge.html?stream=eagle'
```

### 4.3 Оплата

```
┌─────────────┐   fill form   ┌─────────────┐
│ charge.html │ ────────────► │ Payment     │
│             │               │ validation  │
└─────────────┘               └──────┬──────┘
                                     │
                                     │ click "Pay"
                                     ▼
                      window.location = '/index.html'
```

---

## 5. Безопасность

### 5.1 HTTP Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; connect-src 'self' wss://natureonzoom.win;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### 5.2 Валидация

- Форма оплаты валидирует формат полей на клиенте
- Никакие данные не отправляются на сервер
- XSS невозможен (нет пользовательского ввода в DOM)

---

## 6. Деплой

### 6.1 Процесс

```bash
# 1. Собрать статику (опционально)
# Если используется bundler

# 2. Скопировать на сервер
scp -r ./* user@vps:/var/www/nature-on-zoom/

# 3. Перезапустить WebSocket-сервер
ssh user@vps "sudo systemctl restart nature-ws"

# 4. Перезагрузить nginx (если изменилась конфигурация)
ssh user@vps "sudo nginx -t && sudo systemctl reload nginx"
```

### 6.2 Systemd unit для WebSocket-сервера (Node.js)

```ini
# /etc/systemd/system/nature-ws.service
[Unit]
Description=Nature on Zoom WebSocket Server (Node.js)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nature-on-zoom/server
ExecStart=/usr/bin/node index.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=8765

[Install]
WantedBy=multi-user.target
```

---

## 7. Мониторинг и логирование

### 7.1 Логи

| Компонент | Путь |
|-----------|------|
| nginx access | /var/log/nginx/access.log |
| nginx error | /var/log/nginx/error.log |
| WS server | /var/log/nature-ws/app.log |

### 7.2 Healthcheck

```bash
# Проверка WebSocket
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: test" \
     https://natureonzoom.win/ws/heartbeat

# Проверка API
curl https://natureonzoom.win/api/stream/preview/eagle
```

---

**Конец документа SDD v1.0.0**
