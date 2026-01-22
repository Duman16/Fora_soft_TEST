.PHONY: help install dev prod docker-build docker-up docker-down docker-logs docker-dev clean

# Показать помощь по командам
help:
	@echo "Доступные команды:"
	@echo "  make install      - Установить зависимости"
	@echo "  make dev          - Запустить в режиме разработки"
	@echo "  make prod         - Собрать и запустить в продакшен режиме"
	@echo "  make docker-build - Собрать Docker образ"
	@echo "  make docker-up    - Запустить весь стек в Docker"
	@echo "  make docker-down  - Остановить Docker контейнеры"
	@echo "  make docker-logs  - Показать логи приложения"
	@echo "  make docker-dev   - Запустить только БД для разработки"
	@echo "  make clean        - Очистить артефакты сборки"
	@echo "  make test         - Запустить тесты"
	@echo "  make lint         - Проверить код линтером"

# Установка зависимостей
install:
	npm install

# Разработка (только БД в Docker, app локально)
dev:
	@echo "Запускаем PostgreSQL в Docker..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Ожидаем готовности БД..."
	@sleep 5
	@echo "Запускаем приложение..."
	npm run start:dev

# Продакшен (локальный)
prod:
	npm run build
	npm run start:prod

# Docker команды
docker-build:
	docker-compose build

docker-up:
	docker-compose up -d
	@echo "Приложение запущено на http://localhost:3000"
	@echo "Swagger доступен на http://localhost:3000/api"

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f app

docker-dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "PostgreSQL запущен на порту 5432"

# Очистка
clean:
	rm -rf dist node_modules coverage

# Тестирование
test:
	npm run test

test-e2e:
	npm run test:e2e

test-cov:
	npm run test:cov

# Линтинг
lint:
	npm run lint

format:
	npm run format