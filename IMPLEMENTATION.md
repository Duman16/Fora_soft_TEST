# Детальное описание реализации

## Выполненные задачи

###  Задача 1: Аутентификация и регистрация

**Реализованные компоненты:**

1. **User Entity** (`src/users/entities/user.entity.ts`)
   - Все поля из требований: id (UUID), email, password, role, task_id
   - Автоматические timestamps (created_at, updated_at)
   - Enum для ролей: `author` и `user`
   - Отношения: ManyToOne с Task, OneToMany с Comment

2. **Auth Service** (`src/auth/auth.service.ts`)
   - `register()` - регистрация с хешированием пароля через bcrypt (10 rounds)
   - `login()` - вход с проверкой пароля
   - `refreshToken()` - обновление access token (бонус из требований)
   - `generateTokens()` - генерация JWT и refresh токенов

3. **JWT Strategy** (`src/auth/strategies/jwt.strategy.ts`)
   - Passport стратегия для валидации токенов
   - Извлечение пользователя из payload
   - Проверка существования пользователя в БД

4. **Guards** (`src/auth/guards/`)
   - `JwtAuthGuard` - защита эндпоинтов JWT токеном
   - `RolesGuard` - проверка ролей пользователя

5. **Decorators** (`src/auth/decorators/`)
   - `@Roles(...)` - указание требуемых ролей
   - `@CurrentUser()` - получение текущего пользователя

6. **DTOs с валидацией** (`src/auth/dto/`)
   - `RegisterDto` - email, password (min 6 символов), role
   - `LoginDto` - email, password
   - `RefreshTokenDto` - refresh_token

7. **Auth Controller** (`src/auth/auth.controller.ts`)
   - POST `/auth/register` - регистрация
   - POST `/auth/login` - вход
   - POST `/auth/refresh` - обновление токена (бонус)

8. **Users CRUD** (`src/users/`)
   - POST `/users` - создать пользователя
   - GET `/users` - список всех пользователей
   - GET `/users/:id` - получить по ID
   - PATCH `/users/:id` - редактировать
   - DELETE `/users/:id` - удалить
   - Все эндпоинты защищены JWT
   - Пароли исключены из ответов для безопасности

---

###  Задача 2: Создание задач

**Реализованные компоненты:**

1. **Task Entity** (`src/tasks/entities/task.entity.ts`)
   - Все поля: id (UUID), user_id, description (1-1000 символов)
   - Timestamps: created_at, updated_at
   - Отношения: ManyToOne с User, OneToMany с Comment

2. **Tasks Service** (`src/tasks/tasks.service.ts`)
   - `create()` - создание с привязкой к пользователю
   - `findAll()` - сортировка DESC по created_at (новые первыми) 
   - `findOne()` - получение с проверкой существования
   - `update()` - обновление
   - `remove()` - удаление

3. **DTOs с валидацией** (`src/tasks/dto/`)
   - `CreateTaskDto` - description (1-1000 символов) 
   - `UpdateTaskDto` - опциональное description
   - Валидация через @Length(1, 1000)

4. **Tasks Controller** (`src/tasks/tasks.controller.ts`)
   - POST `/tasks` - создать (только role: "user") 
   - GET `/tasks` - список всех задач
   - GET `/tasks/:id` - получить по ID
   - PATCH `/tasks/:id` - редактировать
   - DELETE `/tasks/:id` - удалить
   - Защита JWT + RolesGuard

**Бизнес-правила:**
- Создавать задачу может только пользователь с ролью "user"
- Задачи возвращаются отсортированными по дате (новые первыми)
-  Реализована связь: у задачи может быть несколько комментариев
-  Описание: 1-1000 символов

---

###  Задача 3: CRUD для комментариев

**Реализованные компоненты:**

1. **Comment Entity** (`src/comments/entities/comment.entity.ts`)
   - Все поля: id (UUID), task_id, user_id, text (1-1000 символов)
   - Timestamps: created_at, updated_at
   - Отношения: ManyToOne с Task (CASCADE при удалении), ManyToOne с User

2. **Comments Service** (`src/comments/comments.service.ts`)
   - `create()` - создание с проверкой существования задачи
   - `findByTask()` - получение по task_id, сортировка DESC 
   - `findOne()` - получение с проверкой
   - `update()` - только если user_id === comment.user_id 
   - `remove()` - только если user_id === comment.user_id 
3. **DTOs с валидацией** (`src/comments/dto/`)
   - `CreateCommentDto` - taskId (UUID), text (1-1000 символов) 
   - `UpdateCommentDto` - опциональный text
   - Валидация через @Length(1, 1000)

4. **Comments Controller** (`src/comments/comments.controller.ts`)
   - POST `/comments` - создать (только role: "author") 
   - GET `/comments?task_id=xxx` - список комментариев к задаче 
   - GET `/comments/:id` - получить по ID
   - PATCH `/comments/:id` - редактировать (только свой) 
   - DELETE `/comments/:id` - удалить (только свой) 

**Бизнес-правила:**
-  Редактировать и удалять может только автор комментария
-  Текст обязателен (1-1000 символов)
- Комментарии возвращаются отсортированными по дате (новые первыми)
-  Только пользователь с ролью "author" может создать комментарий

---

## Бонусные возможности (из "Будет плюсом")

###  Swagger документация
- Настроена на `/api` эндпоинте
- Полное описание всех эндпоинтов
- Схемы запросов и ответов
- Поддержка JWT Bearer токенов
- Теги для группировки эндпоинтов
- persistAuthorization для удобства тестирования

###  Refresh токен
- Двухтокеновая система (access + refresh)
- Отдельные секреты для каждого типа токена
- Эндпоинт POST `/auth/refresh` для обновления
- Разные сроки жизни (1h для access, 7d для refresh)

###  Валидация данных
- `class-validator` для всех DTO
- `class-transformer` для преобразования типов
- ValidationPipe с настройками:
  - `whitelist: true` - удаляет лишние поля
  - `forbidNonWhitelisted: true` - ошибка при лишних полях
  - `transform: true` - автоматическое преобразование

---

## Технические решения

### 1. Архитектура
```
src/
├── auth/               # Аутентификация
│   ├── decorators/    # @Roles, @CurrentUser
│   ├── dto/           # RegisterDto, LoginDto, RefreshTokenDto
│   ├── guards/        # JwtAuthGuard, RolesGuard
│   ├── strategies/    # JWT Strategy
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   └── auth.module.ts
├── users/             # Пользователи
│   ├── dto/          # CreateUserDto, UpdateUserDto
│   ├── entities/     # User Entity
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── users.module.ts
├── tasks/            # Задачи
│   ├── dto/
│   ├── entities/
│   ├── tasks.service.ts
│   ├── tasks.controller.ts
│   └── tasks.module.ts
├── comments/         # Комментарии
│   ├── dto/
│   ├── entities/
│   ├── comments.service.ts
│   ├── comments.controller.ts
│   └── comments.module.ts
├── config/          # Конфигурация TypeORM
└── main.ts          # Точка входа
```

### 2. База данных
- PostgreSQL через Docker Compose
- TypeORM для ORM
- Автоматическая синхронизация схемы (для разработки)
- Отношения:
  - User -[1:N]-> Comment
  - Task -[1:N]-> Comment
  - User -[N:1]-> Task (через task_id)

### 3. Безопасность
- bcrypt для хеширования паролей (10 rounds)
- JWT токены с короткими сроками жизни
- Refresh токены с отдельным секретом
- Пароли исключены из всех ответов API
- Guards для защиты эндпоинтов
- Проверка владельца при редактировании/удалении

### 4. Валидация
- DTOs для всех входящих данных
- `class-validator` декораторы:
  - @IsEmail() - валидация email
  - @MinLength() - минимальная длина
  - @Length() - точная длина
  - @IsEnum() - проверка enum
  - @IsUUID() - валидация UUID
  - @IsNotEmpty() - обязательное поле
- Автоматические сообщения об ошибках

### 5. Обработка ошибок
- `NotFoundException` - 404
- `BadRequestException` - 400
- `UnauthorizedException` - 401
- `ForbiddenException` - 403
- Понятные сообщения на русском

---

## Команды для работы

```bash
# Установка
npm install

# Запуск БД
docker-compose up -d

# Разработка
npm run start:dev

# Продакшен
npm run build
npm run start:prod

# Форматирование
npm run format

# Линтинг
npm run lint
```

---

## Тестирование API

### 1. Регистрация автора комментариев
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "author@test.com",
    "password": "password123",
    "role": "author"
  }'
```

### 2. Регистрация создателя задач
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "password123",
    "role": "user"
  }'
```

### 3. Создание задачи (user)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -d '{
    "description": "Реализовать API для комментариев"
  }'
```

### 4. Создание комментария (author)
```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer AUTHOR_ACCESS_TOKEN" \
  -d '{
    "taskId": "TASK_UUID",
    "text": "Отличная задача, начинаю работу!"
  }'
```

### 5. Получение комментариев
```bash
curl http://localhost:3000/comments?task_id=TASK_UUID \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

## Что можно улучшить для продакшена

1. **Тестирование**
   - Unit тесты для сервисов
   - E2E тесты для эндпоинтов
   - Покрытие кода > 80%

2. **Безопасность**
   - Rate limiting (защита от DDoS)
   - CORS настройки
   - Helmet для HTTP заголовков
   - Хранение refresh токенов в БД
   - Отзыв токенов при логауте

3. **Производительность**
   - Redis для кэширования
   - Индексы в БД
   - Пагинация для больших списков
   - Lazy loading для отношений

4. **Мониторинг**
   - Логирование (Winston/Pino)
   - Health checks
   - Metrics (Prometheus)
   - Error tracking (Sentry)

5. **DevOps**
   - Docker для приложения
   - CI/CD пайплайны
   - Миграции вместо synchronize
   - Переменные окружения для разных сред

---

## Заключение

Все требования тестового задания выполнены:

REST API на NestJS + TypeORM + PostgreSQL  
 Аутентификация и регистрация с JWT  
CRUD для пользователей, задач и комментариев  
Все бизнес-правила реализованы  
Swagger документация  
 Refresh токен  
 Полная валидация данных  
 docker-compose.yml для PostgreSQL  
 Dockerfile для приложения (multi-stage build)  
 docker-compose с полным стеком (PostgreSQL + NestJS)  
 Отдельный docker-compose.dev.yml для разработки  
 Health check endpoint для мониторинга  
 GitHub Actions CI/CD pipeline  
 Makefile для удобной работы  
 Подробный README с инструкциями  

Код написан с учетом best practices NestJS, хорошо структурирован, имеет понятные комментарии и готов как к локальной разработке, так и к деплою в Docker.

## Docker деплой (итоговое решение)

### Быстрый старт

```bash
# Клонировать репозиторий
git clone 
cd crm-task-comments-api

# Запустить весь стек
make docker-up
# или
docker-compose up -d

# Приложение доступно на http://localhost:3000
# Swagger на http://localhost:3000/api
```

### Проверка работоспособности

```bash
# Health check
curl http://localhost:3000/health

# Логи приложения
make docker-logs
# или
docker-compose logs -f app
```

### Для разработки

```bash
# Запустить только БД
make docker-dev

# В другом терминале - запустить app с hot-reload
npm run start:dev
```