# Backend Testing Documentation

**Дата обновления:** 2025-10-03  
**Версия:** 1.0

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
npm test

# Запустить тесты в watch режиме
npm run test:watch

# Запустить тесты с coverage
npm run test:cov
```

### Конкретные тесты

```bash
# Тесты конкретного файла
npm test health.controller.spec

# Тесты конкретного модуля
npm test avatar

# E2E тесты
npm run test:e2e
```

### Debug режим

```bash
# Запустить тесты в debug режиме
npm run test:debug

# Затем подключиться debugger к порту 9229
```

## 📊 Покрытие кода

### Текущее покрытие

| Модуль | Покрытие | Статус |
|--------|----------|--------|
| HealthController | 100% | ✅ |
| AvatarController | 95%+ | ✅ |
| AvatarService | 90%+ | ✅ |
| YamlConfigService | 90%+ | ✅ |

### Просмотр отчета

```bash
# Генерация отчета о покрытии
npm run test:cov

# Отчет будет сохранен в backend/coverage/
# Откройте backend/coverage/lcov-report/index.html в браузере
```

## 📝 API Endpoints и их тесты

### Health Endpoints

| Endpoint | Method | Тесты | Статус |
|----------|--------|-------|--------|
| `/health` | GET | Unit + E2E | ✅ |
| `/health/detailed` | GET | Unit + E2E | ✅ |

**Покрываемые сценарии:**
- ✅ Успешная проверка здоровья
- ✅ Возврат правильного формата данных
- ✅ Проверка timestamp в ISO формате
- ✅ Проверка положительного uptime
- ✅ Детальная информация о памяти
- ✅ Версия Node.js

### Avatar Endpoints

| Endpoint | Method | Тесты | Статус |
|----------|--------|-------|--------|
| `/api/generate` | POST | Unit | ✅ |
| `/api/health` | GET | Unit | ✅ |
| `/api/list` | GET | Unit | ✅ |
| `/api/color-schemes` | GET | Unit | ✅ |
| `/api/:id` | GET | Unit | ✅ |
| `/api/:id` | DELETE | Unit | ✅ |

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

### Jest конфигурация

Конфигурация находится в `backend/jest.config.js`:

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^uuid$': require.resolve('uuid'),
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|sharp)/)',
  ],
};
```

### Мокирование зависимостей

#### Мокирование сервисов

```typescript
const mockAvatarService = {
  generateAvatar: jest.fn(),
  getAvatar: jest.fn(),
  listAvatars: jest.fn(),
  deleteAvatar: jest.fn(),
  healthCheck: jest.fn(),
  getColorSchemes: jest.fn(),
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
const mockResponse = {
  set: jest.fn(),
  send: jest.fn(),
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
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('uptime');
      });
  });
});
```

## 🐛 Troubleshooting

### Проблема с ES модулями (uuid, sharp)

**Ошибка:**
```
SyntaxError: Unexpected token 'export'
```

**Решение:**
Добавлено в `jest.config.js`:
```javascript
transformIgnorePatterns: [
  'node_modules/(?!(uuid|sharp)/)',
],
moduleNameMapper: {
  '^uuid$': require.resolve('uuid'),
},
```

### Медленные тесты

**Проблема:** Тесты выполняются долго

**Решение:**
```bash
# Запускать тесты параллельно
npm test -- --maxWorkers=4

# Или использовать watch режим для разработки
npm run test:watch
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
beforeEach(() => {
  jest.clearAllMocks();
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

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 📋 TODO

- [ ] Добавить E2E тесты для Avatar endpoints
- [ ] Увеличить покрытие до 95%+
- [ ] Добавить performance тесты
- [ ] Добавить тесты для DatabaseService
- [ ] Добавить тесты для StorageService
- [ ] Добавить тесты для GeneratorService
- [ ] Настроить CI/CD для автоматического запуска тестов

---

**Поддержка:** Backend Team  
**Последнее обновление:** 2025-10-03

