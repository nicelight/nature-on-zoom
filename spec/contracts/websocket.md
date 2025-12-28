# WebSocket Protocol Contract
# Nature on Zoom — Heartbeat Service

**Версия:** 1.0.0  
**Endpoint:** `wss://{domain}/ws/heartbeat`

---

## 1. Обзор

WebSocket-соединение используется для имитации live-стримингового сервиса.
Клиент поддерживает постоянное соединение и периодически отправляет ping-сообщения.

## 2. Подключение

### URL
```
wss://natureonzoom.win/ws/heartbeat
```

### Headers (отправляются браузером автоматически)
```
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: <random-base64>
```

### Ответ сервера
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: <computed-accept>
```

---

## 3. Протокол сообщений

### 3.1 Ping (Client → Server)

Клиент отправляет ping каждые 30 секунд.

```json
{
  "type": "ping",
  "timestamp": 1703800000000,
  "clientId": "uuid-v4"
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| type | string | Всегда "ping" |
| timestamp | number | Unix timestamp в миллисекундах |
| clientId | string | UUID клиента (генерируется при подключении) |

### 3.2 Pong (Server → Client)

Сервер отвечает на каждый ping.

```json
{
  "type": "pong",
  "timestamp": 1703800000000,
  "serverTime": 1703800000050
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| type | string | Всегда "pong" |
| timestamp | number | Timestamp из ping-сообщения |
| serverTime | number | Серверное время (для расчёта latency) |

### 3.3 Stream Update (Server → Client)

Сервер может отправлять обновления о стримах (опционально, для реалистичности).

```json
{
  "type": "stream_update",
  "streamId": "eagle",
  "viewers": 156,
  "timestamp": 1703800030000
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| type | string | "stream_update" |
| streamId | string | ID стрима |
| viewers | number | Обновлённое количество зрителей |
| timestamp | number | Время обновления |

### 3.4 Error (Server → Client)

```json
{
  "type": "error",
  "code": "INVALID_MESSAGE",
  "message": "Unknown message type"
}
```

---

## 4. Жизненный цикл соединения

```
┌────────┐                              ┌────────┐
│ Client │                              │ Server │
└───┬────┘                              └───┬────┘
    │                                       │
    │  WebSocket Handshake                  │
    │ ─────────────────────────────────────>│
    │                                       │
    │  101 Switching Protocols              │
    │ <─────────────────────────────────────│
    │                                       │
    │  { "type": "ping", ... }              │
    │ ─────────────────────────────────────>│
    │                                       │
    │  { "type": "pong", ... }              │
    │ <─────────────────────────────────────│
    │                                       │
    │        ... (каждые 30 сек) ...        │
    │                                       │
    │  { "type": "stream_update", ... }     │
    │ <─────────────────────────────────────│ (опционально)
    │                                       │
    │  Close connection (user leaves)       │
    │ ─────────────────────────────────────>│
    │                                       │
```

---

## 5. Таймауты

| Параметр | Значение | Описание |
|----------|----------|----------|
| Ping interval | 30 сек | Интервал между ping-сообщениями |
| Server timeout | 60 сек | Сервер закрывает соединение без ping |
| Reconnect delay | 5 сек | Клиент пытается переподключиться |

---

## 6. Коды закрытия

| Код | Описание |
|-----|----------|
| 1000 | Нормальное закрытие |
| 1001 | Клиент покинул страницу |
| 1006 | Потеря соединения |
| 4000 | Ошибка сервера |

---

## 7. Пример клиентского кода

```javascript
class HeartbeatClient {
  constructor(url) {
    this.url = url;
    this.clientId = crypto.randomUUID();
    this.pingInterval = 30000;
    this.reconnectDelay = 5000;
  }

  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.startPing();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
    
    this.ws.onclose = () => {
      this.stopPing();
      setTimeout(() => this.connect(), this.reconnectDelay);
    };
  }

  startPing() {
    this.pingTimer = setInterval(() => {
      this.ws.send(JSON.stringify({
        type: 'ping',
        timestamp: Date.now(),
        clientId: this.clientId
      }));
    }, this.pingInterval);
  }

  stopPing() {
    clearInterval(this.pingTimer);
  }

  handleMessage(data) {
    switch (data.type) {
      case 'pong':
        const latency = Date.now() - data.timestamp;
        console.log(`Latency: ${latency}ms`);
        break;
      case 'stream_update':
        // Обновить UI с новым количеством viewers
        break;
    }
  }
}
```

---

**Конец документа WebSocket Contract v1.0.0**
