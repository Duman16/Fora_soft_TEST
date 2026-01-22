# CRM Task Comments API

REST API модуль "Комментарии к задачам" для CRM-системы.

## Технологии

- Node.js v18+
- NestJS v10
- TypeORM
- PostgreSQL
- TypeScript
- JWT для аутентификации
- class-validator для валидации
- Swagger для документации

## Структура проекта

```
src/
├── auth/           # Модуль аутентификации (JWT, регистрация, логин)
├── users/          # Модуль пользователей (CRUD операции)
├── tasks/          # Модуль задач (CRUD операции)
├── comments/       # Модуль комментариев (CRUD операции)
├── config/         # Конфигурация приложения
├── database/       # Настройки БД и миграции
└── main.ts         # Точка входа
```

## Предварительные требования

- Docker и Docker Compose
- Node.js v18 или выше
- npm или yarn

## Установка и запуск

### Вариант 1: Полный запуск в Docker (рекомендуется для продакшена)

```bash
# 1. Клонируйте репозиторий
git clone 
cd crm-task-comments-api

# 2. Запустите весь стек (PostgreSQL + NestJS App)
docker-compose up -d

# Приложение будет доступно на http://localhost:3000
# Swagger документация: http://localhost:3000/api
```

Это запустит оба контейнера:
- PostgreSQL на порту 5432
- NestJS API на порту 3000

```bash
# Просмотр логов
docker-compose logs -f app

# Остановка
docker-compose down

# Остановка с удалением volumes (очистка БД)
docker-compose down -v
```

### Вариант 2: Разработка (PostgreSQL в Docker, App локально)

Этот вариант удобен для разработки с hot-reload.

```bash
# 1. Клонируйте репозиторий
git clone 
cd crm-task-comments-api

# 2. Установите зависимости
npm install

# 3. Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env при необходимости

# 4. Запустите только PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# 5. Запустите приложение локально
npm run start:dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

### Вариант 3: Локальный запуск без Docker

```bash
# 1. Установите PostgreSQL локально
# 2. Создайте БД crm_db
# 3. Установите зависимости
npm install

# 4. Настройте .env с вашими параметрами PostgreSQL
cp .env.example .env

# 5. Запустите приложение
npm run start:dev
```

## API Документация

Swagger документация доступна по адресу: `http://localhost:3000/api`

## Основные эндпоинты

### Аутентификация

- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход в систему
- `POST /auth/refresh` - Обновление токена

### Пользователи

- `POST /users` - Создать пользователя
- `GET /users` - Получить список всех пользователей
- `GET /users/:id` - Получить пользователя по ID
- `PATCH /users/:id` - Редактировать пользователя
- `DELETE /users/:id` - Удалить пользователя

### Задачи

- `POST /tasks` - Создать задачу (только для роли "пользователь")
- `GET /tasks` - Получить список всех задач
- `GET /tasks/:id` - Получить задачу по ID
- `PATCH /tasks/:id` - Редактировать задачу
- `DELETE /tasks/:id` - Удалить задачу

### Комментарии

- `POST /comments` - Создать комментарий (только для роли "автор")
- `GET /comments?task_id=xxx` - Список комментариев к задаче
- `GET /comments/:id` - Получить комментарий по ID
- `PATCH /comments/:id` - Редактировать комментарий (только свой)
- `DELETE /comments/:id` - Удалить комментарий (только свой)

## Бизнес-правила

### Пользователи
- Роль может быть либо "author" (автор), либо "user" (пользователь)
- task_id в таблице Users используется для связи с задачами

### Задачи
- Только пользователи с ролью "user" могут создавать задачи
- Задачи возвращаются отсортированными по дате (новые первыми)
- У каждой задачи может быть несколько комментариев
- Описание задачи: 1-1000 символов

### Комментарии
- Только пользователи с ролью "author" могут создавать комментарии
- Редактировать и удалять комментарий может только его автор
- Текст комментария обязателен (1-1000 символов)
- Комментарии возвращаются отсортированными по дате (новые первыми)
- Комментарий привязан только к одной задаче

## Примеры использования

### 1. Регистрация пользователя

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### 2. Вход в систему

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Ответ содержит `access_token` и `refresh_token`.

### 3. Создание задачи (требуется роль "user")

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "description": "Описание задачи"
  }'
```

### 4. Создание комментария (требуется роль "author")

```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "taskId": "task-uuid-here",
    "text": "Текст комментария"
  }'
```

## Тестирование

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Архитектурные решения

### 1. Модульная структура
Каждая функциональность выделена в отдельный модуль (auth, users, tasks, comments). Это обеспечивает:
- Легкость поддержки и масштабирования
- Переиспользование кода
- Четкое разделение ответственности

### 2. TypeORM
Использование TypeORM для работы с БД:
- Автоматическая генерация таблиц на основе Entity
- Поддержка миграций
- Type-safe запросы
- Простая работа с отношениями между таблицами

### 3. JWT аутентификация
Реализована двухтокеновая система:
- Access token (короткий срок жизни) для API запросов
- Refresh token (длинный срок жизни) для обновления access token
Это повышает безопасность системы

### 4. Guard'ы и Decorator'ы
Использованы для:
- Проверки аутентификации (JwtAuthGuard)
- Проверки ролей пользователя (RolesGuard)
- Получения текущего пользователя (@CurrentUser)

### 5. Валидация данных
class-validator и class-transformer:
- Автоматическая валидация входящих данных
- Трансформация типов
- Понятные сообщения об ошибках

### 6. Swagger документация
Автоматическая генерация API документации:
- Описание всех эндпоинтов
- Схемы запросов/ответов
- Возможность тестирования API через UI

### 7. Обработка ошибок
Использованы встроенные HTTP исключения NestJS:
- NotFoundException для несуществующих ресурсов
- ForbiddenException для запрещенных действий
- BadRequestException для невалидных данных

### 8. Отношения в БД
- User -> Task: Many-to-One (у пользователя может быть task_id)
- Task -> Comment: One-to-Many (у задачи много комментариев)
- User -> Comment: One-to-Many (пользователь может создать много комментариев)

## Улучшения для продакшена

1. **Безопасность**:
   - Хеширование паролей (bcrypt)
   - Rate limiting
   - CORS настройки
   - Helmet для HTTP заголовков

2. **Логирование**:
   - Winston или Pino для структурированных логов
   - Логирование всех запросов и ошибок

3. **Тестирование**:
   - Unit тесты для всех сервисов
   - E2E тесты для эндпоинтов
   - Покрытие кода > 80%

4. **Мониторинг**:
   - Health checks
   - Metrics (Prometheus)
   - APM (Application Performance Monitoring)

5. **Кэширование**:
   - Redis для часто запрашиваемых данных

## Контакты

