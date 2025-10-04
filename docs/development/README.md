# Руководство по разработке

Документация для разработчиков, работающих над проектом Avatar Generator.

## 📚 Содержание

### Настройка окружения

- **[Setup Guide](./setup.md)** 🟡 Создается  
  Пошаговая настройка окружения разработки

- **[Database Setup](./DATABASE.md)** ✅  
  Настройка и работа с базами данных (SQLite / PostgreSQL)

### Интеграция и разработка

- **[Frontend-Backend Integration](./INTEGRATION.md)** ✅  
  Интеграция frontend и backend, работа с API

### Решение проблем

- **[Troubleshooting](./TROUBLESHOOTING.md)** ✅  
  Устранение частых проблем при разработке

## 🚀 Быстрый старт для разработчиков

### 1. Клонирование и установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd avatar-gen

# Установить зависимости
pnpm install
```

### 2. Настройка Backend

```bash
cd backend

# Генерация .env из settings.yaml
npm run env:generate

# Генерация Prisma client
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# Запуск в dev режиме
npm run start:dev
```

Backend будет доступен на: http://localhost:3000

### 3. Настройка Frontend

```bash
cd frontend

# Запуск dev сервера
npm run dev
```

Frontend будет доступен на: http://localhost:5173

## 🛠️ Основные команды

### Backend

```bash
npm run start:dev     # Dev сервер с hot reload
npm run build         # Production сборка
npm test              # Запуск тестов
npm run test:cov      # Тесты с coverage
npm run lint          # Линтинг
npm run format        # Форматирование кода
```

### Frontend

```bash
npm run dev           # Dev сервер
npm run build         # Production сборка
npm run preview       # Предпросмотр production build
npm run lint          # Линтинг
npm run storybook     # Storybook UI
```

### Корневые команды

```bash
pnpm run dev          # Запуск всего проекта
pnpm run build        # Сборка всего проекта
pnpm run lint         # Линтинг всего проекта
```

## 📖 Детальная документация

### Backend разработка

- [Backend README](../../backend/README.md)
- [Backend Architecture](../../backend/docs/README.md)
- [Database Module](../../backend/docs/modules/database/README.md)
- [Initialization Module](../../backend/src/modules/initialization/README.md)
- [Config Module](../../backend/src/config/README.md)

### Frontend разработка

- [Frontend README](../../frontend/README.md)
- [Frontend Docs](../../frontend/docs/README.md)

### Тестирование

- [Testing Guide](../../backend/docs/TESTING.md)
- [Test Results](../../backend/docs/TEST_RESULTS.md)

## 🐛 Troubleshooting

См. [Troubleshooting Guide](./TROUBLESHOOTING.md) для решения частых проблем.

## 🔗 Связанные разделы

- [Deployment](../deployment/README.md) - Развертывание
- [API Documentation](../api/README.md) - API
- [Contributing](../contributing/README.md) - Контрибуция

---

**Обновлено:** 2025-10-03
