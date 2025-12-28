# DEPLOY RUNBOOK — Nature on Zoom

## Интеграция сайта-заглушки с VPN-сервером

### Схема (после деплоя)

```
Client → Cloudflare → Nginx :443 (TLS)
                          │
                          ├── /api/v1/stream      → Xray :10000 (VPN VLESS+WS)
                          ├── /ws/heartbeat       → Node.js :8765 (WebSocket heartbeat)
                          ├── /api/stream/*       → Node.js :8765 (fake streaming API)
                          ├── /api/health         → Node.js :8765 (healthcheck)
                          └── /                   → Static files (Nature on Zoom site)
```

### Предусловия

- ✅ VPN развёрнут по `VPN-runbook.md`
- ✅ Nginx работает на 443 с Cloudflare Origin Certificate
- ✅ Xray слушает на 127.0.0.1:10000
- ✅ Node.js 18+ установлен на сервере

---

## 1) Установка Node.js 18 (если не установлен)

```bash
# Проверить версию
node -v

# Установка на AlmaLinux 9 через dnf module (как подтверждено тестом)
dnf module reset nodejs -y
dnf module enable nodejs:18 -y
dnf install nodejs -y

# Проверка
node -v
npm -v
```

---

## 2) Подготовка директорий

```bash
# Создать директорию для проекта
mkdir -p /var/www/nature-on-zoom
mkdir -p /var/www/nature-on-zoom/server

# Установить владельца
chown -R nginx:nginx /var/www/nature-on-zoom
```

---

## 3) Загрузка файлов на сервер

### Вариант A: через SCP (с локальной Windows машины)

```powershell
# На Windows (PowerShell)
# Используем пользователя root и IP сервера: 108.181.252.78

scp -r .\css root@108.181.252.78:/var/www/nature-on-zoom/
scp -r .\js root@108.181.252.78:/var/www/nature-on-zoom/
scp -r .\assets root@108.181.252.78:/var/www/nature-on-zoom/
scp .\index.html root@108.181.252.78:/var/www/nature-on-zoom/
scp .\charge.html root@108.181.252.78:/var/www/nature-on-zoom/
scp -r .\server\* root@108.181.252.78:/var/www/nature-on-zoom/server/
```

### Вариант B: через rsync

```bash
# С локальной машины (Linux/Mac/WSL)
rsync -avz --exclude='node_modules' --exclude='.git' \
  ./ <USER>@<IP>:/var/www/nature-on-zoom/
```

### Вариант C: через Git (если репозиторий)

```bash
# На сервере
cd /var/www
git clone <REPO_URL> nature-on-zoom
```

---

## 4) Установка зависимостей Node.js

```bash
cd /var/www/nature-on-zoom/server
npm install --production

# Проверить
ls -la node_modules/
```

---

## 5) Обновление конфигурации (production URL)

Изменить `js/config.js` для production:

```bash
cat > /var/www/nature-on-zoom/js/config.js << 'EOF'
/**
 * Nature on Zoom — Configuration (Production)
 */

const CONFIG = {
  // Production endpoints
  WS_URL: 'wss://natureonzoom.win/ws/heartbeat',
  API_URL: 'https://natureonzoom.win/api',
  
  // WebSocket settings
  HEARTBEAT_INTERVAL: 30000,
  RECONNECT_DELAY: 5000,
  
  // Stream data
  STREAMS: [
    {
      id: 'eagle',
      title: 'Bald Eagle Nest',
      description: 'Majestic bald eagle family nesting in the Alaskan wilderness. Watch the parents care for their eaglets in this stunning HD stream.',
      price: 5,
      status: 'live',
      viewers: 142,
      thumbnail: 'assets/images/eagle-thumb.jpg'
    },
    {
      id: 'owl',
      title: 'Barn Owl Family',
      description: 'A barn owl mother with her fluffy owlets in a rustic farmhouse attic. Night vision enabled for 24/7 viewing.',
      price: 3,
      status: 'live',
      viewers: 89,
      thumbnail: 'assets/images/owl-thumb.jpg'
    },
    {
      id: 'hummingbird',
      title: 'Hummingbird Haven',
      description: 'Tiny hummingbird nest no bigger than a walnut. Witness the miracle of these smallest birds raising their young.',
      price: 4,
      status: 'live',
      viewers: 234,
      thumbnail: 'assets/images/hummingbird-thumb.jpg'
    },
    {
      id: 'osprey',
      title: 'Osprey Overlook',
      description: 'Fish-hunting osprey overlooking a pristine mountain lake. Watch action-packed fishing dives and family interactions.',
      price: 4,
      status: 'live',
      viewers: 67,
      thumbnail: 'assets/images/osprey-thumb.jpg'
    },
    {
      id: 'falcon',
      title: 'Peregrine Falcon Tower',
      description: 'Urban peregrine falcons nesting on a downtown skyscraper. The fastest birds on Earth raise their chicks above the city.',
      price: 5,
      status: 'live',
      viewers: 178,
      thumbnail: 'assets/images/falcon-thumb.jpg'
    },
    {
      id: 'heron',
      title: 'Great Blue Heron Colony',
      description: 'Colonial nesting site with dozens of great blue herons. Stunning social interactions and dramatic feeding moments.',
      price: 2,
      status: 'live',
      viewers: 45,
      thumbnail: 'assets/images/heron-thumb.jpg'
    },
    {
      id: 'penguin',
      title: 'Penguin Nursery',
      description: 'Emperor penguins in Antarctica caring for their precious eggs and chicks. Experience the harsh beauty of the frozen continent.',
      price: 3,
      status: 'live',
      viewers: 312,
      thumbnail: 'assets/images/penguin-thumb.jpg'
    },
    {
      id: 'flamingo',
      title: 'Flamingo Lagoon',
      description: 'Pink flamingos wading in a tropical lagoon. Relaxing and mesmerizing — perfect for stress relief and meditation.',
      price: 1,
      status: 'live',
      viewers: 198,
      thumbnail: 'assets/images/flamingo-thumb.jpg'
    }
  ],

  getStream(id) {
    return this.STREAMS.find(stream => stream.id === id);
  },

  randomizeViewers(base) {
    const variance = Math.floor(base * 0.2);
    return base + Math.floor(Math.random() * variance * 2) - variance;
  }
};

Object.freeze(CONFIG);
Object.freeze(CONFIG.STREAMS);
EOF
```

---

## 6) Создание systemd unit для Node.js сервера

```bash
cat > /etc/systemd/system/nature-ws.service << 'EOF'
[Unit]
Description=Nature on Zoom WebSocket Server
After=network.target

[Service]
Type=simple
User=nginx
Group=nginx
WorkingDirectory=/var/www/nature-on-zoom/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=8765

# Логирование
StandardOutput=append:/var/log/nature-ws/app.log
StandardError=append:/var/log/nature-ws/error.log

# Безопасность
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/log/nature-ws

[Install]
WantedBy=multi-user.target
EOF
```

Создать директорию для логов:

```bash
mkdir -p /var/log/nature-ws
chown nginx:nginx /var/log/nature-ws
```

Запустить сервис:

```bash
systemctl daemon-reload
systemctl enable nature-ws
systemctl start nature-ws
systemctl status nature-ws
```

Проверка:

```bash
curl -s http://127.0.0.1:8765/api/health
# Ожидается: {"status":"ok","timestamp":"...","version":"1.0.0"}
```

---

## 7) Обновление Nginx конфигурации

**ВАЖНО:** Сохраняем VPN path `/api/v1/stream` → Xray:10000

```bash
cat > /etc/nginx/conf.d/natureonzoom.conf << 'EOF'
# Nature on Zoom + VPN (VLESS over WebSocket)

server {
    listen 80;
    server_name natureonzoom.win;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name natureonzoom.win;

    # Cloudflare Origin Certificate
    ssl_certificate     /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Static files root
    root /var/www/nature-on-zoom;
    index index.html;

    # ═══════════════════════════════════════════════════════════════
    # VPN: VLESS over WebSocket (Xray)
    # Путь должен совпадать с inbound в 3X-UI
    # ═══════════════════════════════════════════════════════════════
    location /api/v1/stream {
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # ═══════════════════════════════════════════════════════════════
    # Nature on Zoom: WebSocket Heartbeat (Node.js)
    # Имитация стримингового heartbeat для DPI
    # ═══════════════════════════════════════════════════════════════
    location /ws/heartbeat {
        proxy_pass http://127.0.0.1:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }

    # ═══════════════════════════════════════════════════════════════
    # Nature on Zoom: Fake Streaming API (Node.js)
    # /api/stream/preview/:id, /api/health, /api/streams
    # ═══════════════════════════════════════════════════════════════
    location /api/ {
        # Исключаем VPN путь (уже обработан выше)
        # Проксируем остальные /api/* на Node.js
        proxy_pass http://127.0.0.1:8765/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ═══════════════════════════════════════════════════════════════
    # Static Files (Nature on Zoom frontend)
    # ═══════════════════════════════════════════════════════════════
    location / {
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header Referrer-Policy strict-origin-when-cross-origin;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;
}
EOF
```

Проверить и перезапустить:

```bash
# ВАЖНО: Удалить или переименовать старые конфиги, которые могут содержать 'natureonzoom.win'
# В нашем случае это были fallback.conf и natureonzoom-443.conf
mv /etc/nginx/conf.d/fallback.conf /etc/nginx/conf.d/fallback.conf.bak 2>/dev/null
mv /etc/nginx/conf.d/natureonzoom-443.conf /etc/nginx/conf.d/natureonzoom-443.conf.bak 2>/dev/null

# Проверка синтаксиса (не должно быть [warn] conflicting server name)
nginx -t

# Применить изменения
systemctl reload nginx
```

---

## 8) Установка правильных прав и SELinux

После копирования файлов через SCP права часто сбиваются (особенно если копировали под root), что приводит к **403 Forbidden**.

```bash
# Установить владельца nginx для всех файлов сайта
chown -R nginx:nginx /var/www/nature-on-zoom

# Права на папки (755) и файлы (644)
chmod -R 755 /var/www/nature-on-zoom
find /var/www/nature-on-zoom -type f -exec chmod 644 {} \;

# SELinux: разрешить nginx читать файлы в этой директории (КРИТИЧНО)
chcon -R -t httpd_sys_content_t /var/www/nature-on-zoom
```

---

## 9) SELinux (если включён)

```bash
# Разрешить Nginx проксировать на localhost
setsebool -P httpd_can_network_connect 1

# Проверить
getsebool httpd_can_network_connect
```

---

## 10) Проверки после деплоя

### 10.1 Статус сервисов

```bash
systemctl status nginx
systemctl status nature-ws
systemctl status x-ui
```

### 10.2 Порты

```bash
ss -lntp | egrep ':(80|443|8765|10000)'
```

Ожидается:
- `:80` → nginx
- `:443` → nginx
- `:8765` → node (nature-ws)
- `:10000` → xray

### 10.3 API endpoints

```bash
# Health check
curl -s http://127.0.0.1:8765/api/health

# Stream preview
curl -s http://127.0.0.1:8765/api/stream/preview/eagle

# Через Nginx (HTTPS)
curl -sk https://natureonzoom.win/api/health --resolve natureonzoom.win:443:127.0.0.1
```

### 10.4 WebSocket Heartbeat

```bash
# Через Nginx
curl -vk --http1.1 \
  -H "Host: natureonzoom.win" \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  https://natureonzoom.win/ws/heartbeat \
  --resolve natureonzoom.win:443:127.0.0.1
```

Ожидается: `101 Switching Protocols`

### 10.5 VPN путь (должен работать как раньше)

```bash
curl -vk --http1.1 \
  -H "Host: natureonzoom.win" \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  https://natureonzoom.win/api/v1/stream \
  --resolve natureonzoom.win:443:127.0.0.1
```

Ожидается: `101 Switching Protocols` (Xray)

### 10.6 Проверка сайта в браузере

Открыть: `https://natureonzoom.win`

- ✅ Должна открыться главная страница Nature on Zoom
- ✅ 8 карточек птиц с Live бейджами
- ✅ Клик на Play → OAuth модал
- ✅ Форма оплаты работает

---

## 11) Логи (troubleshooting)

```bash
# Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Nature on Zoom Node.js
tail -f /var/log/nature-ws/app.log
tail -f /var/log/nature-ws/error.log

# Xray
journalctl -u x-ui -f

# SELinux denials
ausearch -m avc -ts recent 2>/dev/null | tail -n 30
```

---

## 12) Checklist после деплоя

- [ ] `https://natureonzoom.win` открывается
- [ ] Сайт выглядит корректно (стили, шрифты, анимации)
- [ ] OAuth модал работает
- [ ] Страница оплаты работает
- [ ] `/api/health` возвращает JSON
- [ ] `/ws/heartbeat` устанавливает WebSocket
- [ ] VPN `/api/v1/stream` работает (101 Switching)
- [ ] VPN клиент (v2rayN) подключается через домен

---

## 13) Rollback (откат)

Если что-то пошло не так:

```bash
# Остановить Node.js
systemctl stop nature-ws
systemctl disable nature-ws

# Вернуть старый nginx конфиг
# (восстановить /etc/nginx/conf.d/natureonzoom.conf из VPN-runbook.md)
nginx -t && systemctl reload nginx

# Удалить файлы
rm -rf /var/www/nature-on-zoom
rm /etc/systemd/system/nature-ws.service
systemctl daemon-reload
```

---

## Итоговая архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE                               │
│                    (TLS termination)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NGINX :443 (TLS)                            │
│                                                                 │
│   /api/v1/stream ──────────► Xray :10000 (VPN VLESS+WS)        │
│                                                                 │
│   /ws/heartbeat ───────────► Node.js :8765 (WebSocket)         │
│   /api/stream/* ───────────► Node.js :8765 (Fake API)          │
│   /api/health ─────────────► Node.js :8765                     │
│                                                                 │
│   /* ──────────────────────► Static files                       │
│                              /var/www/nature-on-zoom/           │
└─────────────────────────────────────────────────────────────────┘

Трафик для DPI выглядит как:
- Основной сайт: стриминговый сервис Nature on Zoom
- WebSocket /ws/heartbeat: heartbeat для "живого" видео
- API /api/stream/*: метаданные стримов (viewers, bitrate)
- WebSocket /api/v1/stream: "внутренний streaming" (на самом деле VPN)
```

---

**Конец DEPLOY-RUNBOOK.md**
