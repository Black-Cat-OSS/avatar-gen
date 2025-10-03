# Руководство по тестированию

Документация по тестированию проекта Avatar Generator.

## 📊 Статистика тестов

**Текущее состояние:**

```
✅ Test Suites: 4 passed, 4 total
✅ Tests:       50 passed, 50 total
⏱️  Time:        ~5s
```

**Покрытие:**

- HealthController: 100%
- AvatarController: 97.61%
- AvatarService: 90.9%
- YamlConfigService: 94.91%

## 🚀 Быстрый старт

```bash
cd backend

# Все тесты
npm test

# С покрытием
npm run test:cov

# Watch режим
npm run test:watch
```

## 📚 Полная документация

Детальная информация о тестировании:

- **[Testing Guide](../../backend/docs/TESTING.md)** ✅  
  Полное руководство по тестированию backend

- **[Test Results](../../backend/docs/TEST_RESULTS.md)** ✅  
  Результаты тестирования и покрытие кода

## 🎯 Покрытые endpoints

- ✅ GET `/health`
- ✅ GET `/health/detailed`
- ✅ POST `/api/generate`
- ✅ GET `/api/health`
- ✅ GET `/api/list`
- ✅ GET `/api/color-schemes`
- ✅ GET `/api/:id`
- ✅ DELETE `/api/:id`

## 🔗 Связанные разделы

- [Development Guide](../development/README.md)
- [API Documentation](../api/README.md)

---

**Обновлено:** 2025-10-03
