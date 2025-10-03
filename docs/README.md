# Avatar Generator - Документация

**Версия:** 3.0  
**Дата обновления:** 2025-10-03  
**Статус:** ✅ Актуально

Добро пожаловать в документацию Avatar Generator - полнофункционального
приложения для генерации аватаров в стиле GitHub/GitLab.

## 🚀 Быстрый старт

### За 5 минут с Docker

```bash
git clone <repository-url>
cd avatar-gen
./scripts/build.sh sqlite
./scripts/start.sh sqlite
```

→ Откройте http://localhost

### Локальная разработка

```bash
pnpm install
cd backend && npm run env:generate && npm run prisma:migrate
cd .. && pnpm run dev
```

→ Backend: http://localhost:3000 | Frontend: http://localhost:5173

---

## 📚 Документация по разделам

### [🚀 Getting Started](./getting-started/)

**Быстрый старт и установка**

- Запуск за 5 минут
- Детальная установка
- Требования и проверка

→ [Перейти к разделу](./getting-started/README.md)

### [🛠️ Development](./development/)

**Руководство для разработчиков**

- [Database Setup](./development/database.md) - Настройка БД (SQLite/PostgreSQL)
- [Frontend-Backend Integration](./development/integration.md) - Интеграция
- [Troubleshooting](./development/troubleshooting.md) - Решение проблем

→ [Перейти к разделу](./development/README.md)

### [🐳 Deployment](./deployment/)

**Развертывание и production**

- [Docker Compose Configuration](./deployment/docker-compose.md) - Полная
  конфигурация
- [Docker README](../docker/README.md) - Основная документация Docker
- [Scripts Documentation](../scripts/README.md) - Скрипты управления

→ [Перейти к разделу](./deployment/README.md)

### [📡 API](./api/)

**API документация и примеры**

- [Swagger UI](http://localhost:3000/swagger) - Интерактивная документация
- 8 endpoints с примерами использования
- Коды ошибок и параметры

→ [Перейти к разделу](./api/README.md)

### [🧪 Testing](./testing/)

**Тестирование проекта**

- 50 тестов, 100% coverage критических endpoints
- [Testing Guide](../backend/docs/TESTING.md)
- [Test Results](../backend/docs/TEST_RESULTS.md)

→ [Перейти к разделу](./testing/README.md)

### [🏗️ Architecture](./architecture/)

**Архитектура проекта**

- Общий обзор системы
- Backend: NestJS, Prisma, Sharp
- Frontend: React, Vite, Tailwind

→ [Перейти к разделу](./architecture/README.md)

### [🤝 Contributing](./contributing/)

**Правила контрибуции**

- [Contributing Guidelines](../CONTRIBUTING.md)
- Стандарты кода
- Правила коммитов

→ [Перейти к разделу](./contributing/README.md)

### [📦 Archive](./archive/)

**Архив устаревших документов**

- Первоначальное ТЗ
- История миграций

→ [Перейти к разделу](./archive/README.md)

---

## 📖 Навигация по задачам

<table>
<tr>
<td width="50%">

**Я хочу начать работу**

- [Quick Start](./getting-started/README.md)
- [Installation](./getting-started/README.md#требования)
- [First Steps](./getting-started/README.md#следующие-шаги)

**Я разработчик**

- [Development Setup](./development/README.md)
- [Database](./development/database.md)
- [Troubleshooting](./development/troubleshooting.md)

**Мне нужна API документация**

- [API Overview](./api/README.md)
- [Swagger](http://localhost:3000/swagger)
- [All Endpoints](./api/README.md#endpoints)

</td>
<td width="50%">

**Я хочу развернуть проект**

- [Docker Deploy](./deployment/README.md)
- [Docker Compose](./deployment/docker-compose.md)
- [Scripts](../scripts/README.md)

**Мне нужна информация об архитектуре**

- [Architecture Overview](./architecture/README.md)
- [Backend Docs](../backend/docs/README.md)
- [Frontend Docs](../frontend/docs/README.md)

**Я хочу внести вклад**

- [Contributing](./contributing/README.md)
- [Code Style](./contributing/README.md#стандарты-кода)
- [Commit Rules](./contributing/README.md#правила-оформления-коммитов)

</td>
</tr>
</table>

---

## 🔧 Технологический стек

<table>
<tr>
<td width="33%">

### Backend

- NestJS 11
- TypeScript 5.9
- Prisma 6.16
- Sharp 0.34
- Pino (logging)
- Zod (validation)

</td>
<td width="33%">

### Frontend

- React 18
- TypeScript 5.9
- Vite 6
- Tailwind CSS
- Redux Toolkit
- React Router 7
- i18next

</td>
<td width="33%">

### DevOps

- Docker + Compose
- Nginx
- pnpm
- ESLint + Prettier
- Husky + lint-staged
- Commitlint

</td>
</tr>
</table>

---

## 🎯 Основные endpoints

| Endpoint             | Method | Описание                     |
| -------------------- | ------ | ---------------------------- |
| `/health`            | GET    | Проверка здоровья приложения |
| `/health/detailed`   | GET    | Детальная информация         |
| `/api/generate`      | POST   | Генерация нового аватара     |
| `/api/list`          | GET    | Список аватаров (пагинация)  |
| `/api/color-schemes` | GET    | Доступные цветовые схемы     |
| `/api/:id`           | GET    | Получить аватар по ID        |
| `/api/:id`           | DELETE | Удалить аватар               |

**Подробнее:** [API Documentation](./api/README.md) |
[Swagger UI](http://localhost:3000/swagger)

---

## 📊 Статус тестирования

```
✅ Test Suites: 4 passed, 4 total
✅ Tests:       50 passed, 50 total
⏱️  Time:        ~5s
```

**Покрытие:**

- HealthController: 100%
- AvatarController: 97.61%
- AvatarService: 90.9%

**Подробнее:** [Testing Guide](./testing/README.md)

---

## 📋 Быстрые команды

### Docker

```bash
./scripts/build.sh [sqlite|postgresql]   # Сборка образов
./scripts/start.sh [sqlite|postgresql]   # Запуск сервисов
./scripts/dev.sh [sqlite|postgresql]     # Dev режим (фоновый)
./scripts/stop.sh [--volumes]            # Остановка
```

### Backend

```bash
cd backend
npm run start:dev    # Dev сервер с hot reload
npm test             # Запуск тестов
npm run test:cov     # Тесты с coverage
npm run build        # Production сборка
```

### Frontend

```bash
cd frontend
npm run dev          # Dev сервер с HMR
npm run build        # Production сборка
npm run storybook    # Storybook UI
```

---

## 📖 Документация модулей

### Backend модули

- [Database Module](../backend/docs/modules/database/README.md) - Работа с БД
- [Initialization Module](../backend/src/modules/initialization/README.md) -
  Инициализация
- [Config Module](../backend/src/config/README.md) - Конфигурация

### Документация по проекту

- [Backend Docs](../backend/docs/README.md) - Полная документация backend
- [Frontend Docs](../frontend/docs/README.md) - Полная документация frontend
- [Docker Docs](../docker/README.md) - Docker конфигурация
- [Scripts Docs](../scripts/README.md) - Все скрипты

---

## 🔍 Полный индекс документации

### По категориям

<details>
<summary><b>Getting Started (Быстрый старт)</b></summary>

- [Getting Started Hub](./getting-started/README.md)
- Quick Start Guide 🟡 (в разработке)
- Installation Guide 🟡 (в разработке)

</details>

<details>
<summary><b>Development (Разработка)</b></summary>

- [Development Hub](./development/README.md)
- [Database Setup](./development/database.md) ✅
- [Integration Guide](./development/integration.md) ✅
- [Troubleshooting](./development/troubleshooting.md) ✅
- Setup Guide 🟡 (в разработке)

</details>

<details>
<summary><b>Deployment (Развертывание)</b></summary>

- [Deployment Hub](./deployment/README.md)
- [Docker Compose Configuration](./deployment/docker-compose.md) ✅
- [Docker README](../docker/README.md) ✅
- [Docker Build Fixes](../docker/DOCKER_BUILD_FIXES.md) ✅
- [Scripts Documentation](../scripts/README.md) ✅
- Production Guide 🟡 (в разработке)

</details>

<details>
<summary><b>API Documentation (API)</b></summary>

- [API Hub](./api/README.md) ✅
- [Swagger UI](http://localhost:3000/swagger) ✅
- Endpoints Reference 🟡 (в разработке)
- Examples 🟡 (в разработке)

</details>

<details>
<summary><b>Testing (Тестирование)</b></summary>

- [Testing Hub](./testing/README.md) ✅
- [Testing Guide](../backend/docs/TESTING.md) ✅
- [Test Results](../backend/docs/TEST_RESULTS.md) ✅

</details>

<details>
<summary><b>Architecture (Архитектура)</b></summary>

- [Architecture Hub](./architecture/README.md) ✅
- [Backend Architecture](../backend/docs/README.md) ✅
- [Frontend Architecture](../frontend/docs/README.md) ✅
- [Database Architecture](../backend/docs/modules/database/ARCHITECTURE.md) ✅
- Overview 🟡 (в разработке)

</details>

<details>
<summary><b>Contributing (Контрибуция)</b></summary>

- [Contributing Hub](./contributing/README.md) ✅
- [Contributing Guidelines](../CONTRIBUTING.md) ✅
- [Commit Messages](../frontend/docs/COMMIT_MESSAGES.md) ✅
- Code Style Guide 🟡 (в разработке)
- PR Guidelines 🟡 (в разработке)

</details>

<details>
<summary><b>Archive (Архив)</b></summary>

- [Archive Hub](./archive/README.md)
- [Backend Task (Original)](./archive/backend_task.md)
- [Docker Migration](./archive/MIGRATION_DOCKER_STRUCTURE.md)
- [Reorganization Plan](./archive/REORGANIZATION_PLAN.md)
- [Reorganization Summary](./archive/REORGANIZATION_SUMMARY.md)

</details>

---

## 🔗 Внешние ресурсы

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vite Documentation](https://vitejs.dev/)

---

## 🆘 Помощь и поддержка

**Не нашли что искали?**

1. Используйте навигацию выше по категориям
2. Проверьте [Troubleshooting](./development/troubleshooting.md)
3. Посмотрите [Backend Docs](../backend/docs/README.md)
4. Создайте issue на GitHub

**Нашли ошибку в документации?**

- Создайте issue с меткой `documentation`
- Или отправьте PR с исправлением

---

## 📝 Статус документации

| Раздел          | Документов | Статус          | Обновлено  |
| --------------- | ---------- | --------------- | ---------- |
| Getting Started | 1          | 🟡 В разработке | 2025-10-03 |
| Development     | 4          | ✅ Актуально    | 2025-10-03 |
| Deployment      | 2          | ✅ Актуально    | 2025-10-03 |
| API             | 1          | ✅ Актуально    | 2025-10-03 |
| Testing         | 1          | ✅ Актуально    | 2025-10-03 |
| Architecture    | 1          | ✅ Актуально    | 2025-10-03 |
| Contributing    | 1          | ✅ Актуально    | 2025-10-03 |
| Archive         | 5          | 📦 Архив        | 2025-10-03 |

**Легенда:** ✅ Актуально | 🟡 В разработке | 📦 Архив

---

## 🎉 Что нового в v3.0

- ✅ Реорганизация по 8 тематическим директориям
- ✅ README хабы для каждой категории
- ✅ Устранено дублирование документации
- ✅ Обновлены все пути (storage/database/)
- ✅ Архивированы устаревшие документы
- ✅ 50 unit тестов с высоким покрытием
- ✅ Централизованная навигация

---

**License:** MIT  
**Поддержка документации:** All Contributors  
**Последнее обновление:** 2025-10-03
