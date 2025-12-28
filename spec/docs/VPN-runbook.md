# RUNBOOK

## VLESS + TLS + WebSocket + Cloudflare (AlmaLinux + Xray + 3X-UI)

### Схема

`Client → Cloudflare (orange cloud) → Nginx :443 (TLS + site) → /api/v1/stream → Xray :10000 (VLESS+WS, localhost)`

Как это выглядит для DPI:
Основной сайт — легитимный стриминговый сервис
WebSocket /ws/heartbeat — heartbeat для "живого" видео
API /api/stream/* — метаданные стримов
WebSocket /api/v1/stream — выглядит как внутренний streaming API, но на самом деле это VPN туннель

---

## 1) Подготовка AlmaLinux

```bash
dnf -y update
dnf -y install epel-release
dnf -y install nginx curl unzip firewalld
systemctl enable --now firewalld
```

Открыть порты:

```bash
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
```

SELinux (если Nginx будет проксировать на localhost):

```bash
getenforce
getsebool httpd_can_network_connect
setsebool -P httpd_can_network_connect 1
getsebool httpd_can_network_connect
```

---

## 2) Nginx (site + WS proxy на Xray)

```bash
cat > /etc/nginx/conf.d/natureonzoom.conf <<'EOF'
server {
  listen 80;
  server_name natureonzoom.win;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name natureonzoom.win;

  ssl_certificate     /etc/ssl/cloudflare/cert.pem;
  ssl_certificate_key /etc/ssl/cloudflare/key.pem;

  root /usr/share/nginx/html;
  index index.html;

  location /api/v1/stream {
    proxy_pass http://127.0.0.1:10000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;
  }

  location / {
    try_files $uri $uri/ =404;
  }
}
EOF

cat > /usr/share/nginx/html/index.html <<'EOF'
<!doctype html><html><head><meta charset="utf-8"><title>Welcome</title></head><body><h1>It works</h1></body></html>
EOF

nginx -t
systemctl enable --now nginx
systemctl restart nginx
systemctl is-enabled nginx
ss -lntp | egrep ':(80|443)'
curl -Ik https://natureonzoom.win --resolve natureonzoom.win:443:127.0.0.1
```

---

## 3) Cloudflare

### 3.1 Добавить домен

Account home → Domains → `Enter an existing domain` → Continue → Free.

### 3.2 DNS

DNS → A запись на IP сервера (**108.181.252.78**) → **Proxied (orange cloud)**.

### 3.3 Включить WebSockets

Network → WebSockets → **ON**.

### 3.4 SSL режим

SSL/TLS → Overview → **Full (strict)**.

---

## 4) Cloudflare Origin Certificate → сервер

Cloudflare → SSL/TLS → Origin Server → Create Certificate:

* Hostname: `natureonzoom.win`
* RSA
* 15 years

На сервере:

```bash
mkdir -p /etc/ssl/cloudflare
nano /etc/ssl/cloudflare/cert.pem   # вставить Certificate
nano /etc/ssl/cloudflare/key.pem    # вставить Private Key
chmod 600 /etc/ssl/cloudflare/*
```

---

## 5) Установка Xray + 3X-UI

```bash
bash <(curl -Ls https://raw.githubusercontent.com/MHSanaei/3x-ui/master/install.sh)
```

Вопрос по SSL панели: выбрать **2 (Self-signed certificate)**.

Открыть порт панели (порт панели: **37525**):

```bash
firewall-cmd --permanent --add-port=37525/tcp
firewall-cmd --reload
```

URL панели:

* `https://108.181.252.78:37525/orexELoH8qpXVGzVx2/`

Автозапуск и статус:

```bash
systemctl is-enabled x-ui
systemctl status x-ui
```

Если панель даёт 404 по корню — задать base path:

```bash
x-ui   # 7) Reset Web Base Path  →  /   →  13) Restart
```

Если забыли логин/пароль:

```bash
x-ui   # 6) Reset Username & Password
```

---

## 6) Inbound в 3X-UI (VLESS + WS, localhost)

Inbound:

* Protocol: **VLESS**
* Listen IP (если есть): **127.0.0.1**
* Port: **10000**
* Transport: **WebSocket**
* Host: **natureonzoom.win**
* Path: **/api/v1/stream**

Client:

* UUID: **Generate**
* Authentication: **X25519 (not Post-Quantum)**
* decryption: **none**
* encryption: **none**

TLS:

* **OFF** (TLS завершается на Nginx)

Other:

* Proxy Protocol: **OFF**
* Heartbeat: **0**
* Sniffing: **OFF**

Restart:

```bash
systemctl restart x-ui
```

Проверка локального WS endpoint (ожидаем 400/404 без TLS ошибок — это нормально для HEAD):

```bash
curl -I http://127.0.0.1:10000/api/v1/stream
```

## 7) Проверки (сервер)

Локально (origin):

```bash
curl -Ik https://natureonzoom.win/api/v1/stream --resolve natureonzoom.win:443:127.0.0.1
```

WS Upgrade тест (можно выполнить **с Windows** или **с сервера**):

Windows (PowerShell/CMD):

```bash
curl -vk --http1.1 -H "Host: natureonzoom.win" -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" https://natureonzoom.win/api/v1/stream
```

Server (через SSH):

```bash
curl -vk --http1.1 -H "Host: natureonzoom.win" -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" https://127.0.0.1/api/v1/stream
```

Ожидается `101 Switching Protocols`.

Проверка прокси Nginx → Xray (если в error.log `Permission denied`):

```bash
getenforce
getsebool httpd_can_network_connect
setsebool -P httpd_can_network_connect 1
systemctl restart nginx
```

AVC (SELinux) логи:

```bash
ausearch -m avc -ts recent 2>/dev/null | tail -n 30
```

---

## 7) Проверки (снаружи)

Сайт через Cloudflare:

* открыть `https://natureonzoom.win` (должна быть заглушка)

Примечание про сертификат:

* если открыть **IP** (`https://108.181.252.78`) — браузер может ругаться на сертификат (нормально для Cloudflare Origin CA или mismatch домен/IP)
* проверяйте через **домен** или используйте `curl -k` при `--resolve`

Порты:

```bash
ss -lntp | egrep ':(80|443|10000|37525)'
```

---

## 8) Закрыть origin (только Cloudflare IP) — включать ПОСЛЕ отладки

(Ограничиваем вход на **443** только IP Cloudflare.)

```bash
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  firewall-cmd --permanent --add-rich-rule="rule family=ipv4 source address=$ip port protocol=tcp port=443 accept"
done
firewall-cmd --permanent --add-rich-rule="rule port protocol=tcp port=443 drop"
firewall-cmd --reload
```

---

## 9) Anti-DPI (клиент)

* Reconnect: **каждые 27 минут**
* MTU: **не max-MTU** (по умолчанию или ~1280–1400)

---

## 10) Клиент (параметры)

v2rayN (Windows):

* Protocol: **VLESS**
* Address: **natureonzoom.win**
* Port: **443**
* TLS: **ON**
* Transport: **WS**
* WS Host: **natureonzoom.win**
* WS Path: **/api/v1/stream**
* UUID: (из 3X-UI)
* Encryption: **none**
* AllowInsecure: **OFF**

### 10.1 Как сделать правильную ссылку vless:// из шаблона 3X-UI

3X-UI часто выдаёт ссылку для прямого подключения к Xray (мимо Nginx+Cloudflare), например:

```text
vless://<UUID>@108.181.252.78:10000?type=ws&encryption=none&path=%2Fapi%2Fv1%2Fstream&host=natureonzoom.win&security=none#<NAME>
```

Чтобы она работала через **Cloudflare → Nginx:443 → Xray:10000**, нужно:

* заменить `@108.181.252.78:10000` на `@natureonzoom.win:443`
* заменить `security=none` на `security=tls`
* добавить `sni=natureonzoom.win`
* остальное оставить как есть: `type=ws`, `encryption=none`, `host=natureonzoom.win`, `path=/api/v1/stream`

Готовый шаблон:

```text
vless://<UUID>@natureonzoom.win:443?type=ws&encryption=none&path=%2Fapi%2Fv1%2Fstream&host=natureonzoom.win&security=tls&sni=natureonzoom.win#<NAME>
```

Импорт в v2rayN:

* Server → Import from clipboard (после копирования ссылки)
