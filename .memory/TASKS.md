# TASKS — Nature on Zoom

## Kanban

### Done ✅

#### US 1 — Discovery
- [x] US 1.GOV — Discovery: анализ и планирование
  - [x] T 1.1 — CONSULT: уточнение требований с тимлидом (2025-12-28)
  - [x] T 1.2 — Создание документации (SRS, SDD, контракты) (2025-12-28)
  - [x] T 1.3 — CONSULT: выбор технологии WebSocket-сервера → Node.js (2025-12-28)

#### US 2 — Frontend: базовая структура ✅ (2025-12-28)
- [x] US 2.GOV — Подготовка дизайн-системы
  - [x] T 2.0 — REFLECT: финализация цветовой палитры и типографики
- [x] T 2.1 — HTML-каркас
  - [x] T 2.1.1 — index.html: структура главной страницы
  - [x] T 2.1.2 — charge.html: структура страницы оплаты
  - [x] T 2.1.3 — Meta-теги, favicon, подключение шрифтов
- [x] T 2.2 — CSS дизайн-система
  - [x] T 2.2.1 — variables.css: CSS-переменные (цвета, размеры, тени)
  - [x] T 2.2.2 — reset.css: нормализация стилей
  - [x] T 2.2.3 — base.css: типографика, базовые элементы
  - [x] T 2.2.4 — components.css: переиспользуемые компоненты
  - [x] T 2.2.5 — animations.css: keyframe-анимации
  - [x] T 2.2.6 — style.css: main stylesheet с responsive
- [x] T 2.3 — SVG-иконки (встроены в HTML)
  - [x] T 2.3.1 — logo.svg: логотип Nature on Zoom
  - [x] T 2.3.2 — icon-watch.svg: иконка меню Watch
  - [x] T 2.3.3 — icon-charge.svg: иконка меню Charge
  - [x] T 2.3.4 — icon-check.svg: иконка меню Check
  - [x] T 2.3.5 — icon-play.svg: кнопка Play
  - [x] T 2.3.6 — icon-google.svg: логотип Google для OAuth
  - [x] T 2.3.7 — icon-lock.svg: иконка замка для формы оплаты
  - [x] T 2.3.8 — favicon.svg: favicon

#### US 3 — Frontend: компоненты ✅ (2025-12-28)
- [x] T 3.1 — Навигационное меню (header)
  - [x] T 3.1.1 — HTML-разметка меню
  - [x] T 3.1.2 — CSS-стили меню (hover, active states)
  - [x] T 3.1.3 — Интеграция SVG-иконок с анимациями
  - [x] T 3.1.4 — Мобильная адаптация (responsive)
- [x] T 3.2 — Компонент видео-фрейма
  - [x] T 3.2.1 — HTML-разметка одного фрейма
  - [x] T 3.2.2 — CSS-стили фрейма (карточка с тенью)
  - [x] T 3.2.3 — Область превью (gradient фон)
  - [x] T 3.2.4 — Кнопка Play с hover-анимацией
  - [x] T 3.2.5 — Отображение заголовка, описания, цены
  - [x] T 3.2.6 — Генерация 8 фреймов из config.js
- [x] T 3.3 — Модальное окно OAuth
  - [x] T 3.3.1 — HTML-разметка модального окна
  - [x] T 3.3.2 — CSS-стили (backdrop blur, центрирование)
  - [x] T 3.3.3 — Анимация открытия/закрытия (fade + scale)
  - [x] T 3.3.4 — Имитация формы Google Sign-In
  - [x] T 3.3.5 — Кнопка закрытия (X)
  - [x] T 3.3.6 — JS: showOAuthModal(streamId), hideOAuthModal()
- [x] T 3.4 — Форма оплаты
  - [x] T 3.4.1 — HTML-разметка формы
  - [x] T 3.4.2 — CSS-стили полей ввода (focus states)
  - [x] T 3.4.3 — Маска ввода номера карты (XXXX XXXX XXXX XXXX)
  - [x] T 3.4.4 — Маска ввода даты (MM/YY)
  - [x] T 3.4.5 — Валидация CVV (3 цифры)
  - [x] T 3.4.6 — Отображение суммы из URL-параметра
  - [x] T 3.4.7 — Кнопка Pay с анимацией loading
  - [x] T 3.4.8 — JS: handlePayment() → редирект на главную
  - [x] T 3.4.9 — Визуальный preview карты

#### US 4 — WebSocket-сервер (Node.js) ✅ (2025-12-28)
- [x] T 4.1 — CONSULT: выбор Python vs Node.js → Node.js (2025-12-28)
- [x] T 4.2 — Инициализация проекта
  - [x] T 4.2.1 — Создать server/package.json
  - [x] T 4.2.2 — Структура папок (routes/, ws/)
- [x] T 4.3 — HTTP API сервер
  - [x] T 4.3.1 — server/index.js: инициализация express
  - [x] T 4.3.2 — routes/api.js: роутер API
  - [x] T 4.3.3 — GET /api/stream/preview/:id — метаданные стрима
  - [x] T 4.3.4 — GET /api/health — healthcheck
  - [x] T 4.3.5 — CORS headers для dev-режима
- [x] T 4.4 — WebSocket сервер
  - [x] T 4.4.1 — ws/heartbeat.js: обработчик WebSocket
  - [x] T 4.4.2 — Ping/Pong протокол (см. контракт)
  - [x] T 4.4.3 — Stream updates broadcast
  - [x] T 4.4.4 — Логирование соединений

#### US 5 — Frontend: JavaScript логика ✅ (2025-12-28)
- [x] T 5.1 — Конфигурация
  - [x] T 5.1.1 — js/config.js: URL endpoints, данные 8 стримов
- [x] T 5.2 — WebSocket-клиент
  - [x] T 5.2.1 — js/websocket.js: класс HeartbeatClient
  - [x] T 5.2.2 — connect(), reconnect(), sendPing()
  - [x] T 5.2.3 — Обработка pong и stream_update
  - [x] T 5.2.4 — fetchStreamPreview(id) на hover
  - [x] T 5.2.5 — Fallback для development режима
- [x] T 5.3 — Инициализация приложения
  - [x] T 5.3.1 — js/main.js: DOMContentLoaded handler
  - [x] T 5.3.2 — Рендеринг 8 фреймов из config
  - [x] T 5.3.3 — Привязка обработчиков кликов на Play
  - [x] T 5.3.4 — Инициализация WebSocket-клиента
- [x] T 5.4 — OAuth логика
  - [x] T 5.4.1 — js/oauth.js: модуль OAuth
  - [x] T 5.4.2 — Открытие модального окна с streamId
  - [x] T 5.4.3 — Сохранение streamId в sessionStorage
  - [x] T 5.4.4 — Редирект на /charge.html?stream={id}
- [x] T 5.5 — Payment логика
  - [x] T 5.5.1 — js/payment.js: модуль оплаты
  - [x] T 5.5.2 — Чтение stream ID из URL
  - [x] T 5.5.3 — Валидация формы
  - [x] T 5.5.4 — Редирект на index.html после "оплаты"

#### US 6 — Тестирование ✅ (2025-12-29)
- [x] T 6.1 — Локальное тестирование
  - [x] T 6.1.1 — Проверка всех user flows (UC-01 — UC-05) ✅
  - [x] T 6.1.2 — Тест WebSocket соединения (simulation mode работает) ✅
  - [x] T 6.1.3 — Тест API endpoints (/api/health, /api/stream/preview/:id, /api/streams) ✅
- [x] T 6.2 — Проверка правдоподобности
  - [x] T 6.2.1 — Анализ Network tab (выглядит как стриминг) ✅
  - [x] T 6.2.2 — Проверка WebSocket heartbeat в DevTools ✅
  - [x] T 6.2.3 — Валидация HTML (незначительные замечания исправлены) ✅

#### US 7 — Деплой на VPS ✅ (2025-12-29)
- [x] US 7.GOV — Подготовка к деплою
  - [x] T 7.0 — CONSULT: доступ к VPS ✅, домен: natureonzoom.win ✅ (2025-12-28)
- [x] T 7.1 — Подготовка сервера
  - [x] T 7.1.1 — Установка Node.js 18+ на Alma Linux ✅
  - [x] T 7.1.2 — Настройка nginx конфигурации ✅
  - [x] T 7.1.3 — Создание systemd unit для WS-сервера ✅
  - [x] T 7.1.4 — Создание директории /var/www/nature-on-zoom ✅
- [x] T 7.2 — Деплой кода
  - [x] T 7.2.1 — Копирование frontend файлов ✅
  - [x] T 7.2.2 — Копирование и npm install для server/ ✅
  - [x] T 7.2.3 — Запуск systemd service ✅
  - [x] T 7.2.4 — Перезагрузка nginx ✅
- [x] T 7.3 — Проверка production
  - [x] T 7.3.1 — Тест через Cloudflare (HTTPS) ✅ — LIVE
  - [x] T 7.3.2 — Проверка WebSocket через wss:// ✅
  - [x] T 7.3.3 — Проверка API endpoints ✅


### To Do
(пусто)

### In Progress
(пусто)
(пусто)

## TODO (отложенные решения)
- [ ] TODO-01: Выбор платёжного провайдера (Stripe/PayPal/полная имитация)
- [x] TODO-02: Генерация/подборка превью-изображений гнёзд (8 шт)
- [ ] TODO-03: Миграция на реальный OAuth Google
- [ ] TODO-04: Мобильная адаптация расширенная (touch gestures)
- [ ] TODO-05: Добавление дополнительных страниц (About, Contact) для правдоподобности

## Шаблон GOV-узла
```markdown
- [ ] US X.GOV — Discovery: [область]
  - [ ] T X.0 — CONSULT: [вопросы к тимлиду]
  - [ ] T X.1 — REFLECT: [анализ альтернатив]
```

## Статистика выполнения

| User Story | Задач | Выполнено | Статус |
|------------|-------|-----------|--------|
| US 1 — Discovery | 3 | 3 | ✅ 100% |
| US 2 — Frontend структура | 17 | 17 | ✅ 100% |
| US 3 — Frontend компоненты | 24 | 24 | ✅ 100% |
| US 4 — WebSocket сервер | 13 | 13 | ✅ 100% |
| US 5 — JS логика | 15 | 15 | ✅ 100% |
| US 6 — Тестирование | 7 | 7 | ✅ 100% |
| US 7 — Деплой | 12 | 12 | ✅ 100% |

**Общий прогресс:** 91/91 задач (100% MVP)
