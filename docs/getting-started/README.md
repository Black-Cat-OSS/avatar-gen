# Быстрый старт

Руководство для быстрого начала работы с Avatar Generator.

## 📚 Содержание

- **[Quick Start Guide](./quick-start.md)** 🟡 Создается  
  Запуск проекта за 5 минут

- **[Installation Guide](./installation.md)** 🟡 Создается  
  Детальная установка и настройка

## ⚡ Быстрый старт (5 минут)

### Вариант 1: Docker (Рекомендуется)

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd avatar-gen

# 2. Собрать и запустить
./scripts/build.sh sqlite
./scripts/start.sh sqlite
```

Готово! Откройте http://localhost

### Вариант 2: Локальная разработка

```bash
# 1. Установить зависимости
pnpm install

# 2. Настроить backend
cd backend
npm run env:generate
npm run prisma:generate
npm run prisma:migrate

# 3. Запустить
cd ..
pnpm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Swagger: http://localhost:3000/swagger

## 📋 Требования

### Минимальные требования

- **Node.js:** 20+ (backend), 22+ (frontend)
- **pnpm:** 8+
- **Git:** 2.40+

### Для Docker

- **Docker:** 20+
- **Docker Compose:** 2.0+

### Опционально

- **PostgreSQL:** 15+ (если не используете Docker)
- **SQLite:** 3.40+

## 🔧 Проверка установки

```bash
# Проверить версии
node --version
pnpm --version
docker --version
docker-compose --version

# Проверить работу backend
curl http://localhost:3000/api/health

# Должен вернуть
# {"statusCode":200,"message":"Health check completed","data":{"database":"connected","status":"healthy"}}
```

## 📖 Следующие шаги

После успешного запуска:

1. **Изучите API** - откройте http://localhost:3000/swagger
2. **Сгенерируйте аватар** - используйте POST /api/generate
3. **Просмотрите результат** - GET /api/list
4. **Изучите документацию:**
   - [Development Guide](../development/README.md)
   - [API Documentation](../api/README.md)
   - [Deployment](../deployment/README.md)

## 🆘 Проблемы?

Если возникли проблемы:

1. Проверьте [Troubleshooting Guide](../development/troubleshooting.md)
2. Проверьте [Docker Build Fixes](../../docker/DOCKER_BUILD_FIXES.md)
3. Создайте issue в GitHub

## 🔗 Полезные ссылки

- [Главная документация](../README.md)
- [Полный индекс](../INDEX.md)
- [Backend документация](../../backend/README.md)
- [Frontend документация](../../frontend/README.md)

---

**Обновлено:** 2025-10-03
