# Backend Testing Documentation

**Дата обновления:** 2025-10-12  
**Версия:** 2.0  
**Тестовый фреймворк:** Vitest

Документация по тестированию backend приложения Avatar Generator.

## 📋 Обзор

Backend приложение покрыто тестами на трех уровнях:

- **Unit тесты** - тестирование отдельных компонентов
- **Integration тесты** - тестирование взаимодействия компонентов
- **E2E тесты** - тестирование API эндпоинтов

## 🧪 Структура тестов

```
backend/
├── src/
│   ├── config/
│   │   └── yaml-config.service.spec.ts     # Unit тесты конфигурации
│   └── modules/
│       ├── health/
│       │   └── health.controller.spec.ts    # Unit тесты health controller
│       └── avatar/
│           ├── avatar.controller.spec.ts    # Unit тесты avatar controller
│           └── avatar.service.spec.ts       # Unit тесты avatar service
└── test/
    └── health.e2e-spec.ts                  # E2E тесты health endpoints
```

## 🚀 Запуск тестов

### Все тесты

```bash
# Запустить все тесты
pnpm test

# Запустить тесты в watch режиме
pnpm run test:watch

# Запустить тесты с coverage
pnpm run test:cov

# Запустить тесты с UI интерфейсом
pnpm run test:ui
```

### Конкретные тесты

```bash
# Тесты конкретного файла
pnpm test health.controller.spec

# Тесты конкретного модуля
pnpm test avatar

# E2E тесты
pnpm run test:e2e
```

### Debug режим

Vitest поддерживает встроенный debug режим через UI:

```bash
# Запустить UI с возможностью debug
pnpm run test:ui
```

## 📊 Покрытие кода

### Текущее покрытие

| Модуль            | Покрытие | Статус |
| ----------------- | -------- | ------ |
| HealthController  | 100%     | ✅     |
| AvatarController  | 95%+     | ✅     |
| AvatarService     | 90%+     | ✅     |
| YamlConfigService | 90%+     | ✅     |

### Просмотр отчета

```bash
# Генерация отчета о покрытии
pnpm run test:cov

# Отчет будет сохранен в backend/coverage/
# Откройте backend/coverage/lcov-report/index.html в браузере
```

## 📝 API Endpoints и их тесты

### Health Endpoints

| Endpoint           | Method | Тесты      | Статус |
| ------------------ | ------ | ---------- | ------ |
| `/health`          | GET    | Unit + E2E | ✅     |
| `/health/detailed` | GET    | Unit + E2E | ✅     |

**Покрываемые сценарии:**

- ✅ Успешная проверка здоровья
- ✅ Возврат правильного формата данных
- ✅ Проверка timestamp в ISO формате
- ✅ Проверка положительного uptime
- ✅ Детальная информация о памяти
- ✅ Версия Node.js

### Avatar Endpoints

| Endpoint             | Method | Тесты | Статус |
| -------------------- | ------ | ----- | ------ |
| `/api/generate`      | POST   | Unit  | ✅     |
| `/api/health`        | GET    | Unit  | ✅     |
| `/api/list`          | GET    | Unit  | ✅     |
| `/api/color-schemes` | GET    | Unit  | ✅     |
| `/api/:id`           | GET    | Unit  | ✅     |
| `/api/:id`           | DELETE | Unit  | ✅     |

**Покрываемые сценарии:**

#### POST /api/generate

- ✅ Успешная генерация аватара
- ✅ Генерация с кастомными цветами
- ✅ Генерация с seed
- ✅ Генерация с цветовой схемой
- ✅ Ошибка при невалидных параметрах
- ✅ Ошибка при слишком длинном seed (>32 символов)

#### GET /api/health

- ✅ Успешная проверка здоровья
- ✅ Проверка подключения к БД
- ✅ Проверка доступности storage
- ✅ Ошибка при недоступности ресурсов

#### GET /api/list

- ✅ Получение списка с пагинацией
- ✅ Использование параметров pick и offset
- ✅ Значения по умолчанию (pick=10, offset=0)
- ✅ Валидация максимального pick (max=100)
- ✅ Сортировка по дате создания (desc)

#### GET /api/color-schemes

- ✅ Получение списка цветовых схем
- ✅ Правильный формат данных

#### GET /api/:id

- ✅ Получение аватара по ID
- ✅ Применение фильтра (grayscale, sepia, negative)
- ✅ Изменение размера (size 5-9)
- ✅ Установка правильных HTTP заголовков
- ✅ Ошибка 404 при несуществующем ID
- ✅ Ошибка при невалидном размере

#### DELETE /api/:id

- ✅ Успешное удаление аватара
- ✅ Ошибка 404 при несуществующем ID
- ✅ Обработка ошибок БД

## 🔧 Конфигурация тестов

### Vitest конфигурация

Конфигурация находится в `backend/vitest.config.ts` (для unit тестов) и `backend/vitest.config.e2e.ts` (для e2e тестов):

```typescript
// backend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./test/vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      exclude: [
        '**/*.interface.ts',
        '**/*.enum.ts',
        '**/*.dto.ts',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      src: resolve(__dirname, './src'),
    },
  },
});
```

### Мокирование зависимостей

#### Мокирование сервисов

```typescript
import { vi } from 'vitest';

const mockAvatarService = {
  generateAvatar: vi.fn(),
  getAvatar: vi.fn(),
  listAvatars: vi.fn(),
  deleteAvatar: vi.fn(),
  healthCheck: vi.fn(),
  getColorSchemes: vi.fn(),
};

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AvatarController],
    providers: [
      {
        provide: AvatarService,
        useValue: mockAvatarService,
      },
    ],
  }).compile();

  controller = module.get<AvatarController>(AvatarController);
});
```

#### Мокирование Response объекта

```typescript
import { vi } from 'vitest';

const mockResponse = {
  set: vi.fn(),
  send: vi.fn(),
} as unknown as Response;
```

## 📖 Примеры тестов

### Unit тест контроллера

```typescript
describe('POST /api/generate', () => {
  it('should generate avatar successfully', async () => {
    const dto: GenerateAvatarDto = {
      primaryColor: '#FF0000',
      foreignColor: '#00FF00',
      seed: 'test-seed',
    };

    const mockResult = {
      id: 'test-uuid',
      createdAt: new Date(),
      version: '0.0.1',
    };

    mockAvatarService.generateAvatar.mockResolvedValue(mockResult);

    const result = await controller.generateAvatar(dto);

    expect(result).toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Avatar generated successfully',
      data: mockResult,
    });
    expect(mockAvatarService.generateAvatar).toHaveBeenCalledWith(dto);
  });
});
```

### E2E тест

```typescript
describe('GET /health', () => {
  it('should return health status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
      });
  });
});
```

## 🐛 Troubleshooting

### Проблема с ES модулями (uuid, sharp)

**Решение:**
Vitest нативно поддерживает ES модули. Все моки настроены в `test/vitest-setup.ts`:

```typescript
import { vi } from 'vitest';

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mocked-uuid-v4'),
  v1: vi.fn(() => 'mocked-uuid-v1'),
}));

vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mocked-image')),
    grayscale: vi.fn().mockReturnThis(),
    negate: vi.fn().mockReturnThis(),
    modulate: vi.fn().mockReturnThis(),
  }));

  return { default: mockSharp };
});
```

### Медленные тесты

**Проблема:** Тесты выполняются долго

**Решение:**

```bash
# Vitest по умолчанию запускает тесты параллельно
# Использовать watch режим для разработки
pnpm run test:watch

# Или UI режим для интерактивной отладки
pnpm run test:ui
```

### Ошибки таймаута

**Решение:**

```typescript
// Увеличить таймаут для конкретного теста
it('long running test', async () => {
  // ...
}, 10000); // 10 секунд
```

## ✅ Best Practices

### 1. Изоляция тестов

```typescript
import { vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});
```

### 2. Описательные названия

```typescript
// Плохо
it('test 1', () => {});

// Хорошо
it('should return 404 when avatar not found', () => {});
```

### 3. Arrange-Act-Assert паттерн

```typescript
it('should generate avatar successfully', async () => {
  // Arrange
  const dto = { seed: 'test' };
  mockService.generateAvatar.mockResolvedValue(mockResult);

  // Act
  const result = await controller.generateAvatar(dto);

  // Assert
  expect(result.statusCode).toBe(201);
  expect(mockService.generateAvatar).toHaveBeenCalled();
});
```

### 4. Тестирование граничных случаев

```typescript
describe('POST /api/generate', () => {
  it('should handle empty seed', async () => {
    const dto = { seed: '' };
    await controller.generateAvatar(dto);
    expect(mockService.generateAvatar).toHaveBeenCalled();
  });

  it('should reject seed longer than 32 characters', async () => {
    const dto = { seed: 'a'.repeat(33) };
    await expect(service.generateAvatar(dto)).rejects.toThrow();
  });
});
```

## 📚 Дополнительные ресурсы

- [Vitest Documentation](https://vitest.dev/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Migration from Jest to Vitest](https://vitest.dev/guide/migration.html)

## 📋 TODO

- [ ] Добавить E2E тесты для Avatar endpoints
- [ ] Увеличить покрытие до 95%+
- [ ] Добавить performance тесты
- [ ] Добавить тесты для DatabaseService
- [ ] Добавить тесты для StorageService
- [ ] Добавить тесты для GeneratorService
- [x] Настроить CI/CD для автоматического запуска тестов
- [x] Добавить матричное тестирование для разных конфигураций
- [x] Изолировать тестовые данные от production

## 🔧 Тестовая конфигурация

### Файл `settings.test.yaml`

Тесты используют специальную конфигурацию:

- **Storage**:
  - По умолчанию: `local` (для изоляции тестов)
  - Для S3 тестов: тестовый бакет `avatar-gen-test`
  - Тестовый endpoint: `https://test-s3-endpoint.com`
  - ⚠️ **Важно**: Никогда не используйте production бакет для тестов!
- **Database**:
  - SQLite in-memory (для скорости)
  - Отдельная тестовая БД для каждого запуска
- **Server**:
  - Порт 3002 (отдельный от production и development)
- **Logging**:
  - Минимальный уровень (error)
  - Без verbose вывода

### Матричное тестирование

В GitHub Actions используется матричное тестирование:

- **SQLite + Local Storage** - быстрые тесты
- **SQLite + S3 Storage** - тесты с тестовым S3 бакетом
- **PostgreSQL + Local Storage** - полные интеграционные тесты
- **PostgreSQL + S3 Storage** - полные тесты с S3

Все S3 тесты используют **изолированный тестовый бакет** `avatar-gen-test`.

---

**Поддержка:** Backend Team  
**Последнее обновление:** 2025-10-12  
**Тестовый фреймворк:** Vitest v2.1.9
