# CRM Task Comments API

REST API модуль "Комментарии к задачам" для CRM-системы.

## Описание проекта

Полнофункциональный REST API для управления задачами и комментариями в CRM-системе. Реализует аутентификацию с JWT токенами, ролевой доступ, валидацию данных и полный CRUD для всех сущностей.

## Технологический стек

### Backend
- Node.js v18+
- NestJS v10
- TypeScript v5
- TypeORM v0.3

### База данных
- PostgreSQL v15

### Аутентификация и безопасность
- Passport.js
- JWT (JSON Web Tokens)
- bcrypt для хеширования паролей

### Валидация
- class-validator
- class-transformer

### Документация
- Swagger/OpenAPI v3

### DevOps
- Docker
- Docker Compose

## Архитектура проекта

Проект построен на модульной архитектуре NestJS. Каждый модуль инкапсулирует свою бизнес-логику и имеет четкие границы ответственности.

### Структура модулей

```
src/
├── auth/               Модуль аутентификации
│   ├── decorators/    Кастомные декораторы (@Roles, @CurrentUser)
│   ├── dto/           Data Transfer Objects
│   ├── guards/        Guards для защиты маршрутов (JWT, Roles)
│   ├── strategies/    Passport стратегии
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users/             Модуль управления пользователями
│   ├── dto/
│   ├── entities/
│   ├── enums/         UserRole enum
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
├── tasks/             Модуль управления задачами
│   ├── dto/
│   ├── entities/
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   └── tasks.module.ts
│
├── comments/          Модуль управления комментариями
│   ├── dto/
│   ├── entities/
│   ├── comments.controller.ts
│   ├── comments.service.ts
│   └── comments.module.ts
│
├── health/            Health check модуль
│   ├── health.controller.ts
│   └── health.module.ts
│
├── config/            Конфигурация
│   └── typeorm.config.ts
│
├── app.module.ts      Корневой модуль
└── main.ts            Точка входа приложения
```

## Модель данных

### Users (Пользователи)
```
id          UUID        Уникальный идентификатор
email       string      Email пользователя (уникальный)
password    string      Хешированный пароль
role        enum        Роль (author | user)
task_id     UUID        Связь с задачей (опционально)
created_at  timestamp   Дата создания
updated_at  timestamp   Дата обновления
```

### Tasks (Задачи)
```
id          UUID        Уникальный идентификатор
user_id     UUID        ID создателя задачи
description string      Описание задачи (1-1000 символов)
created_at  timestamp   Дата создания
updated_at  timestamp   Дата обновления
```

### Comments (Комментарии)
```
id          UUID        Уникальный идентификатор
task_id     UUID        ID задачи
user_id     UUID        ID автора комментария
text        string      Текст комментария (1-1000 символов)
created_at  timestamp   Дата создания
updated_at  timestamp   Дата обновления
```

### Связи между таблицами
- User -> Task: Many-to-One (пользователь может быть привязан к задаче через task_id)
- Task -> Comment: One-to-Many (у задачи может быть много комментариев)
- User -> Comment: One-to-Many (пользователь может создать много комментариев)
- Task -> User: Many-to-One (задача создается пользователем)

## Бизнес-правила

### Пользователи
- Email должен быть уникальным
- Пароль хешируется через bcrypt перед сохранением
- Роль может быть только "author" или "user"
- Пароли не возвращаются в API ответах

### Задачи
- Создавать задачи может только пользователь с ролью "user"
- Описание задачи обязательно и должно быть от 1 до 1000 символов
- Задачи возвращаются отсортированными по дате создания (новые первыми)
- У каждой задачи может быть несколько комментариев
- При удалении задачи каскадно удаляются все комментарии

### Комментарии
- Создавать комментарии может только пользователь с ролью "author"
- Редактировать комментарий может только его автор
- Удалять комментарий может только его автор
- Текст комментария обязателен (1-1000 символов)
- Комментарии возвращаются отсортированными по дате (новые первыми)
- Комментарий должен быть привязан к существующей задаче

### Аутентификация
- Access token действителен 1 час
- Refresh token действителен 7 дней
- Все защищенные эндпоинты требуют валидный JWT токен

## Быстрый старт

### Предварительные требования
- Node.js v18 или выше
- Docker и Docker Compose
- npm или yarn

### Установка

```bash
# Клонирование репозитория
git clone 
cd crm-task-comments-api

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env

# Запуск PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Ожидание инициализации БД
sleep 10

# Запуск приложения
npm run start:dev
```

Приложение будет доступно на http://localhost:3000

Swagger документация: http://localhost:3000/api

## Варианты запуска

### Вариант 1: Режим разработки (рекомендуется)

```bash
# Запуск PostgreSQL в Docker
docker-compose -f docker-compose.dev.yml up -d

# Запуск приложения с hot-reload
npm run start:dev
```

### Вариант 2: Через ts-node

```bash
# Запуск PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Запуск приложения
npx ts-node src/main.ts
```

### Вариант 3: Продакшен режим

```bash
# Сборка
npm run build

# Запуск
npm run start:prod
```

### Вариант 4: Полный Docker стек

```bash
# Запуск PostgreSQL и NestJS в Docker
docker-compose up -d

# Приложение будет доступно на http://localhost:3000
```

## Конфигурация

### Переменные окружения (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=crm_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development
```

Примечание: В продакшене обязательно измените JWT секреты на случайные строки.

## API Эндпоинты

### Аутентификация

```
POST   /auth/register      Регистрация нового пользователя
POST   /auth/login         Вход в систему
POST   /auth/refresh       Обновление access токена
```

### Пользователи (требуется JWT)

```
POST   /users              Создать пользователя
GET    /users              Получить список всех пользователей
GET    /users/:id          Получить пользователя по ID
PATCH  /users/:id          Обновить пользователя
DELETE /users/:id          Удалить пользователя
```

### Задачи (требуется JWT)

```
POST   /tasks              Создать задачу (только role: user)
GET    /tasks              Получить список всех задач
GET    /tasks/:id          Получить задачу по ID
PATCH  /tasks/:id          Обновить задачу
DELETE /tasks/:id          Удалить задачу
```

### Комментарии (требуется JWT)

```
POST   /comments           Создать комментарий (только role: author)
GET    /comments?task_id=  Получить комментарии к задаче
GET    /comments/:id       Получить комментарий по ID
PATCH  /comments/:id       Обновить комментарий (только свой)
DELETE /comments/:id       Удалить комментарий (только свой)
```

### Health Check

```
GET    /health             Проверка работоспособности API
```

## Примеры использования API

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

Ответ:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
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

### 3. Создание задачи

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "description": "Разработать REST API для CRM системы"
  }'
```

### 4. Создание комментария

```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTHOR_TOKEN" \
  -d '{
    "taskId": "task-uuid-here",
    "text": "Начинаю работу над задачей"
  }'
```

### 5. Получение комментариев к задаче

```bash
curl "http://localhost:3000/comments?task_id=task-uuid-here" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Swagger документация

После запуска приложения Swagger UI доступен по адресу:

```
http://localhost:3000/api
```

Swagger предоставляет:
- Интерактивную документацию всех эндпоинтов
- Возможность тестировать API прямо из браузера
- Схемы запросов и ответов
- Описание всех параметров и их валидации
- Поддержку JWT Bearer токенов

## Архитектурные решения и обоснование

### 1. Модульная архитектура

**Обоснование**: NestJS предоставляет модульную структуру "из коробки". Каждый модуль (auth, users, tasks, comments) инкапсулирует свою бизнес-логику, что обеспечивает:
- Легкость поддержки и масштабирования
- Возможность независимой разработки модулей
- Переиспользование кода
- Четкое разделение ответственности (Single Responsibility Principle)

### 2. TypeORM для работы с базой данных

**Обоснование**: TypeORM выбран как ORM решение по следующим причинам:
- Автоматическая генерация таблиц на основе Entity классов
- Type-safe запросы благодаря TypeScript
- Поддержка миграций для контроля изменений схемы БД
- Простая работа с отношениями между таблицами
- Active Record и Data Mapper паттерны
- Встроенная поддержка транзакций

### 3. JWT аутентификация с двумя токенами

**Обоснование**: Реализована система с access и refresh токенами:
- **Access token** (короткий срок жизни - 1h): используется для API запросов, минимизирует риски при компрометации
- **Refresh token** (длинный срок жизни - 7d): используется только для обновления access token
- Отдельные секреты для каждого типа токена повышают безопасность
- Пользователю не нужно часто вводить пароль
- Возможность отзыва refresh токенов в будущем (blacklist)

### 4. Guards и Decorators

**Обоснование**: Использование Guards и Custom Decorators обеспечивает:
- **JwtAuthGuard**: централизованная проверка аутентификации
- **RolesGuard**: проверка ролей пользователя для доступа к эндпоинтам
- **@CurrentUser()**: чистый и читаемый код без прямого доступа к request объекту
- **@Roles()**: декларативное указание требуемых ролей
- Переиспользование логики авторизации
- Легкость тестирования

### 5. DTO и валидация через class-validator

**Обоснование**: Data Transfer Objects с валидацией обеспечивают:
- Автоматическую валидацию входящих данных
- Трансформацию типов (string -> number, etc)
- Понятные сообщения об ошибках для клиента
- Защиту от некорректных данных на уровне API
- Документирование ожидаемой структуры данных
- Swagger автоматически генерирует схемы из DTO

### 6. Swagger документация

**Обоснование**: Автоматическая генерация документации через Swagger:
- Всегда актуальная документация (генерируется из кода)
- Интерактивное тестирование API без Postman
- Схемы запросов и ответов для фронтенд разработчиков
- Уменьшение времени на онбординг новых разработчиков
- Стандартизация API описания (OpenAPI 3.0)

### 7. Обработка ошибок

**Обоснование**: Использование встроенных NestJS HTTP exceptions:
- **NotFoundException** (404): для несуществующих ресурсов
- **ForbiddenException** (403): для запрещенных действий
- **BadRequestException** (400): для невалидных данных
- **UnauthorizedException** (401): для проблем с аутентификацией
- Единообразная обработка ошибок по всему приложению
- Понятные сообщения об ошибках на русском языке

### 8. Хеширование паролей через bcrypt

**Обоснование**: bcrypt с 10 rounds выбран для хеширования паролей:
- Устойчив к brute-force атакам (медленный по дизайну)
- Автоматическое добавление соли
- Проверенное временем решение
- Настраиваемая сложность (cost factor)
- Защита от rainbow table атак

### 9. Разделение сред (development/production)

**Обоснование**: Разные конфигурации для разработки и продакшена:
- **Development**: synchronize: true для автоматической синхронизации схемы БД
- **Production**: миграции для контролируемых изменений БД
- Разные порты для избежания конфликтов (5433 для dev)
- Отдельные docker-compose файлы
- Возможность использования разных баз данных

### 10. Health Check эндпоинт

**Обоснование**: Эндпоинт /health для мониторинга:
- Проверка работоспособности приложения
- Проверка подключения к базе данных
- Информация об uptime и окружении
- Необходим для Docker healthcheck
- Используется load balancer'ами и мониторинг системами

## Валидация данных

Все входящие данные проходят валидацию через class-validator декораторы:

### Пользователи
- Email: должен быть валидным email адресом
- Пароль: минимум 6 символов
- Роль: только "author" или "user"

### Задачи
- Описание: обязательно, от 1 до 1000 символов

### Комментарии
- task_id: должен быть валидным UUID
- Текст: обязателен, от 1 до 1000 символов

ValidationPipe настроен глобально в main.ts:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Удаляет поля не описанные в DTO
    forbidNonWhitelisted: true,   // Выдает ошибку при лишних полях
    transform: true,              // Автоматически преобразует типы
  }),
);
```

## Тестирование

### Unit тесты

```bash
npm run test
```

### E2E тесты

```bash
npm run test:e2e
```

### Покрытие кода

```bash
npm run test:cov
```

## Docker

### Development (только БД)

```bash
# Запуск
docker-compose -f docker-compose.dev.yml up -d

# Остановка
docker-compose -f docker-compose.dev.yml down

# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f

# Удаление с очисткой данных
docker-compose -f docker-compose.dev.yml down -v
```

### Production (полный стек)

```bash
# Сборка и запуск
docker-compose up -d --build

# Остановка
docker-compose down

# Просмотр логов приложения
docker-compose logs -f app

# Просмотр логов БД
docker-compose logs -f postgres
```

### Docker образ приложения

Dockerfile использует multi-stage build для оптимизации размера:
- **Builder stage**: компиляция TypeScript в JavaScript
- **Production stage**: только необходимые зависимости и скомпилированный код
- Образ работает от непривилегированного пользователя для безопасности
- Включен HEALTHCHECK для автоматической проверки работоспособности

## Полезные команды

```bash
# Установка зависимостей
npm install

# Разработка с hot-reload
npm run start:dev

# Сборка проекта
npm run build

# Продакшен запуск
npm run start:prod

# Линтинг
npm run lint

# Форматирование кода
npm run format

# Docker команды
npm run docker:build        # Собрать образ
npm run docker:up           # Запустить весь стек
npm run docker:down         # Остановить контейнеры
npm run docker:logs         # Просмотр логов
npm run docker:dev          # Запустить только БД
npm run docker:dev:down     # Остановить БД

# Очистка
npm run clean               # Удалить dist и node_modules
npm run rebuild             # Полная пересборка
```

## Решение проблем

### Порт 5432 занят

Если локально установлен PostgreSQL:

```bash
# Вариант 1: Остановить локальный PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql # Linux

# Вариант 2: Использовать другой порт (уже настроено на 5433)
# Проверьте .env файл: DB_PORT=5433
```

### Ошибка подключения к БД

```bash
# Пересоздать контейнер БД
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
sleep 10
```

### Ошибки сборки TypeScript

```bash
# Полная очистка и пересборка
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### Cannot find module errors

```bash
# Запуск через ts-node вместо скомпилированного кода
npx ts-node src/main.ts
```

### Проверка работоспособности

```bash
# Health check
curl http://localhost:3000/health

# Ожидаемый ответ
{
  "status": "ok",
  "timestamp": "2026-01-23T...",
  "uptime": 123.456,
  "database": "connected",
  "environment": "development"
}
```

## Дополнительная документация

- IMPLEMENTATION.md - Детальное описание реализации
- TROUBLESHOOTING.md - Решение распространенных проблем
- SUCCESS.md - Пошаговая инструкция успешного запуска
- FILES_CHECKLIST.md - Чеклист файлов проекта
- FIX_GUIDE.md - Руководство по исправлению ошибок

## Улучшения для продакшена

### Безопасность
- Rate limiting для защиты от DDoS
- Helmet для безопасных HTTP заголовков
- CORS настройки
- Хранение refresh токенов в БД с возможностью отзыва
- Blacklist для скомпрометированных токенов

### Производительность
- Redis для кэширования часто запрашиваемых данных
- Индексы в базе данных для оптимизации запросов
- Пагинация для больших списков
- Lazy loading для отношений TypeORM
- Connection pooling для БД

### Мониторинг
- Логирование через Winston или Pino
- Centralized logging (ELK stack)
- Metrics через Prometheus
- Error tracking через Sentry
- APM (Application Performance Monitoring)

### База данных
- Миграции вместо synchronize в продакшене
- Регулярные бэкапы БД
- Read replicas для масштабирования чтения
- Connection retry logic