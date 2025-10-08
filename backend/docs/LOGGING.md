# Логирование в Backend

Система логирования использует библиотеку `pino` с поддержкой ротации файлов через `pino-roll` в production режиме.

## Архитектура

### LoggerService

Основной сервис логирования (`backend/src/modules/logger/logger.service.ts`):

- Реализует интерфейс `LoggerService` из NestJS
- Автоматически выбирает режим логирования на основе конфигурации
- Поддерживает два режима: development (консоль) и production (файл + консоль)

### Режимы работы

#### Development режим (`pretty: true`)

```yaml
app:
  logging:
    level: 'debug'
    verbose: true
    pretty: true
```

**Особенности:**

- Логи выводятся в консоль с цветной подсветкой
- Читаемый формат с временными метками
- Поддержка verbose режима для детального логирования
- Использует `pino-pretty` для форматирования

**Пример вывода:**

```
[12:34:56.789] INFO (MyService): User created successfully
[12:34:56.790] DEBUG (DatabaseService): Query executed in 15ms
```

#### Production режим (`pretty: false`)

```yaml
app:
  logging:
    level: 'warn'
    verbose: false
    pretty: false
```

**Особенности:**

- **Двойная запись**: логи и в файл, и в stdout
- **Ротация файлов**: автоматическое управление размером и количеством файлов
- **JSON формат**: структурированные логи для анализа
- **Оптимизированная производительность**: минимальный overhead

**Структура файлов:**

```
backend/logs/
├── app.log                 # Текущий лог-файл
├── app.log.2025-10-06      # Ротированный файл (вчера)
├── app.log.2025-10-05      # Ротированный файл (-2 дня)
└── ...                     # До 7 файлов максимум
```

## Конфигурация

### Параметры логирования

```yaml
app:
  logging:
    level: 'info' # Уровень логирования
    verbose: false # Детальное логирование
    pretty: false # Красивое форматирование (только development)
```

#### `level`

Уровень логирования в порядке возрастания важности:

- `trace` - Самые детальные логи (отладка)
- `debug` - Отладочная информация
- `info` - Общая информация (по умолчанию)
- `warn` - Предупреждения
- `error` - Ошибки
- `fatal` - Критические ошибки

#### `verbose`

Включает дополнительную детализацию:

- В development: более подробный формат вывода
- В production: не влияет на файловые логи

#### `pretty`

Определяет режим работы:

- `true` - Development режим (консоль с форматированием)
- `false` - Production режим (файл + консоль, JSON формат)

### Настройка ротации (Production)

Ротация файлов настраивается автоматически в `LoggerService`:

```javascript
{
  file: './logs/app.log',    // Путь к основному файлу
  frequency: 'daily',        // Ротация по дням
  size: '10M',              // Максимальный размер файла
  limit: {
    count: 7,               // Хранить 7 файлов
  },
  mkdir: true,              // Автоматически создавать директорию
}
```

## Использование

### В сервисах

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doSomething() {
    this.logger.log('Starting operation');

    try {
      // Ваша логика
      this.logger.debug('Debug information');
      this.logger.log('Operation completed successfully');
    } catch (error) {
      this.logger.error('Operation failed', error.stack);
      throw error;
    }
  }
}
```

### Доступные методы

- `log(message, context?)` - Информационное сообщение
- `error(message, trace?, context?)` - Ошибка с трассировкой
- `warn(message, context?)` - Предупреждение
- `debug(message, context?)` - Отладочная информация
- `verbose(message, context?)` - Детальная информация

### Контекст

Всегда указывайте контекст для лучшей читаемости:

```typescript
this.logger.log('User created', 'UserService');
this.logger.error('Database connection failed', error.stack, 'DatabaseService');
```

## Мониторинг и анализ

### Просмотр логов в реальном времени

```bash
# Просмотр текущих логов
tail -f backend/logs/app.log

# Просмотр через Docker
docker logs -f avatar-gen-backend

# Просмотр с фильтрацией по уровню
grep '"level":50' backend/logs/app.log  # Только ошибки
```

### Анализ структурированных логов

```bash
# Поиск ошибок за последний час
grep '"level":50' backend/logs/app.log | grep "$(date '+%Y-%m-%dT%H')"

# Подсчёт ошибок по типам
grep '"level":50' backend/logs/app.log | jq -r '.context' | sort | uniq -c

# Анализ производительности
grep '"msg":"Query executed"' backend/logs/app.log | jq -r '.duration'
```

### Интеграция с системами мониторинга

JSON формат логов позволяет легко интегрироваться с:

- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Fluentd/Fluent Bit**
- **Prometheus + Grafana**
- **DataDog**
- **New Relic**

Пример конфигурации для Fluentd:

```ruby
<source>
  @type tail
  path /app/logs/app.log
  pos_file /var/log/fluentd/app.log.pos
  tag backend.logs
  format json
  time_key time
  time_format %Y-%m-%dT%H:%M:%S.%LZ
</source>
```

## Docker интеграция

### Монтирование директории логов

В `docker-compose.prod.yaml`:

```yaml
services:
  avatar-backend:
    volumes:
      - ../backend/logs:/app/logs # Монтирование директории логов
    environment:
      - NODE_ENV=production
```

### Создание директорий

Deploy скрипт автоматически создаёт директории логов:

```bash
# Step 2.3: Create log directories
mkdir -p backend/logs
chmod 777 backend/logs
```

## Best Practices

### 1. Используйте правильные уровни

```typescript
// ✅ Правильно
this.logger.error('Database connection failed', error.stack, 'DatabaseService');
this.logger.warn('Rate limit approaching', 'AuthService');
this.logger.log('User logged in', 'AuthService');
this.logger.debug('Cache hit for key: user_123', 'CacheService');

// ❌ Неправильно
this.logger.error('User clicked button'); // Не ошибка
this.logger.log('Critical system failure'); // Должно быть error
```

### 2. Включайте контекст

```typescript
// ✅ Хорошо
this.logger.log('Avatar generated', 'AvatarService');
this.logger.error('S3 upload failed', error.stack, 'StorageService');

// ❌ Плохо
this.logger.log('Success');
this.logger.error('Failed');
```

### 3. Логируйте структурированные данные

```typescript
// ✅ Для production анализа
this.logger.log('User action', {
  userId: user.id,
  action: 'avatar_generated',
  duration: Date.now() - startTime,
  context: 'AvatarService',
});

// ❌ Сложно анализировать
this.logger.log(`User ${user.id} generated avatar in ${duration}ms`);
```

### 4. Не логируйте чувствительные данные

```typescript
// ✅ Безопасно
this.logger.log('User authenticated', {
  userId: user.id,
  context: 'AuthService',
});

// ❌ Опасно
this.logger.log('User authenticated', {
  userId: user.id,
  password: user.password, // НИКОГДА!
  context: 'AuthService',
});
```

### 5. Используйте trace для отладки

```typescript
// ✅ Для детальной отладки
this.logger.verbose('Processing request', {
  requestId: req.id,
  method: req.method,
  url: req.url,
  context: 'RequestHandler',
});
```

## Отладка проблем

### Логи не создаются

1. Проверьте права доступа к директории:

   ```bash
   ls -la backend/logs/
   chmod 777 backend/logs/
   ```

2. Проверьте конфигурацию:

   ```bash
   grep -A 10 "logging:" backend/settings.yaml
   ```

3. Проверьте переменные окружения:
   ```bash
   echo $NODE_ENV
   ```

### Логи в неправильном формате

1. Проверьте режим pretty:

   ```yaml
   app:
     logging:
       pretty: false # Должно быть false в production
   ```

2. Перезапустите приложение после изменения конфигурации

### Файлы не ротируются

1. Проверьте размер файлов:

   ```bash
   ls -lh backend/logs/
   ```

2. Проверьте права на запись:

   ```bash
   touch backend/logs/test.log
   ```

3. Проверьте место на диске:
   ```bash
   df -h .
   ```

## Производительность

### Оптимизация для высоких нагрузок

1. **Используйте подходящий уровень логирования:**

   ```yaml
   app:
     logging:
       level: 'warn' # Только важные события в production
   ```

2. **Ограничьте verbose логирование:**

   ```yaml
   app:
     logging:
       verbose: false # Отключить в production
   ```

3. **Мониторьте размер логов:**

   ```bash
   # Проверка размера логов
   du -sh backend/logs/

   # Автоматическая очистка старых логов
   find backend/logs/ -name "*.log.*" -mtime +30 -delete
   ```

### Метрики производительности

- **Overhead логирования**: ~1-2% CPU в production режиме
- **Размер файлов**: ~1MB на 10,000 записей
- **Скорость записи**: ~100,000 записей/сек

## Миграция и обновления

### Обновление pino

При обновлении версии pino проверьте:

1. Совместимость с `pino-roll`
2. Изменения в API
3. Производительность

### Изменение формата логов

При изменении формата логирования:

1. Обновите парсеры в системах мониторинга
2. Проверьте совместимость с существующими логами
3. Обновите документацию

## Заключение

Система логирования обеспечивает:

- ✅ **Гибкость**: разные режимы для development и production
- ✅ **Производительность**: оптимизированная запись в production
- ✅ **Надёжность**: автоматическая ротация и создание директорий
- ✅ **Мониторинг**: структурированные JSON логи
- ✅ **Безопасность**: контроль чувствительных данных
