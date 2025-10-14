# Backend Testing Documentation

Документация по тестированию backend приложения Avatar Generator.

## 📊 Статус тестирования

```
✅ Test Suites: 4 passed, 4 total
✅ Tests:       50 passed, 50 total
⏱️  Time:        ~18s
```

## 📚 Документация

### [Testing Guide](./TESTING.md)

Полное руководство по тестированию backend:

- Структура тестов
- Запуск тестов
- API Endpoints и их тесты
- Конфигурация тестов
- Примеры тестов
- Troubleshooting

### [Test Results](./TEST_RESULTS.md)

Детальные результаты тестирования:

- Результаты тестирования
- Покрытие кода по модулям
- Покрытые endpoints
- Созданные тестовые файлы
- План улучшения покрытия

## 🎯 Покрытие

### Модули с высоким покрытием

| Модуль            | Покрытие | Статус |
| ----------------- | -------- | ------ |
| HealthController  | 100%     | ✅     |
| AvatarController  | 97.61%   | ✅     |
| AvatarService     | 90.9%    | ✅     |
| YamlConfigService | 94.91%   | ✅     |

### Покрытые endpoints

- ✅ GET `/health`
- ✅ GET `/health/detailed`
- ✅ POST `/api/generate`
- ✅ GET `/api/health`
- ✅ GET `/api/list`
- ✅ GET `/api/color-schemes`
- ✅ GET `/api/:id`
- ✅ DELETE `/api/:id`

## 🚀 Быстрый старт

```bash
# Все тесты
pnpm test

# С coverage
pnpm run test:cov

# Watch режим
pnpm run test:watch

# UI режим
pnpm run test:ui

# Конкретный модуль
pnpm test avatar
```

## 📁 Структура тестов

```
backend/
├── src/
│   ├── config/
│   │   └── yaml-config.service.spec.ts     # Unit тесты
│   └── modules/
│       ├── health/
│       │   └── health.controller.spec.ts    # Unit тесты
│       └── avatar/
│           ├── avatar.controller.spec.ts    # Unit тесты
│           └── avatar.service.spec.ts       # Unit тесты
└── test/
    ├── health.e2e-spec.ts                  # E2E тесты
    └── vitest-setup.ts                      # Setup для моков
```

## 🎯 План улучшения

### Приоритет: Высокий

- [ ] GeneratorService (текущее: 8.86%)
- [ ] DatabaseService (текущее: 14.28%)

### Приоритет: Средний

- [ ] PostgresDatabaseService (текущее: 9.52%)
- [ ] SqliteDatabaseService (текущее: 10.25%)
- [ ] StorageService (текущее: 14.58%)

### Цель

- **Общее покрытие:** 80%+
- **Критические модули:** 90%+

## 🔗 Связанные разделы

- [Modules Documentation](../modules/README.md)
- [Changelog](../changelog/README.md)
- [Main Documentation](../../README.md)

---

**Обновлено:** 2025-10-12  
**Тестовый фреймворк:** Vitest (мигрировано с Jest)
