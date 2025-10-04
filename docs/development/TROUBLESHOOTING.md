# Backend Troubleshooting

## Проблема: Backend зависает при запуске

### Симптомы

- Backend не запускается
- Нет сообщений об ошибках в консоли
- Приложение "зависает" после компиляции

### Диагностика

#### Шаг 1: Проверка логов

```bash
cd backend
Get-Content logs/dev-backend-error.log -Tail 50
```

#### Шаг 2: Попытка запуска напрямую

```bash
node dist/main.js
```

#### Шаг 3: Создание диагностического скрипта

Создайте файл `test-start.js`:

```javascript
console.log('Starting test...');
try {
  console.log('Importing main...');
  require('./dist/main.js');
  console.log('Main imported successfully');
} catch (error) {
  console.error('Error starting application:', error);
  process.exit(1);
}
```

Запустите:

```bash
node test-start.js
```

### Решение

#### Проблема с базой данных SQLite

**Ошибка:**

```
Error code 14: Unable to open the database file
```

**Решение:**

1. Сгенерируйте Prisma Client:

```bash
npx prisma generate
```

2. Примените миграции:

```bash
npx prisma migrate deploy
```

Или для dev окружения:

```bash
npx prisma migrate dev
```

3. Проверьте, что база данных создана:

```bash
Test-Path storage/database/database.sqlite
```

4. Запустите backend:

```bash
npm run start:dev
```

### Проверка работоспособности

После успешного запуска backend должен быть доступен:

```bash
# Проверка health endpoint
curl http://localhost:3000/api/health

# Должен вернуть:
# {"statusCode":200,"message":"Health check completed","data":{"database":true,"status":"healthy"}}
```

## Другие возможные проблемы

### Порт занят

Проверьте, не занят ли порт 3000:

```bash
netstat -ano | findstr :3000
```

Если порт занят, остановите процесс:

```bash
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Проблемы с зависимостями

Переустановите зависимости:

```bash
Remove-Item -Recurse -Force node_modules
npm install
```

### Проблемы с компиляцией

Очистите dist и пересоберите:

```bash
Remove-Item -Recurse -Force dist
npm run build
```

## Логирование

Backend использует pino для логирования. Если нужно увидеть более подробные
логи:

```bash
$env:LOG_LEVEL="debug"
npm run start:dev
```

Уровни логирования:

- `fatal` - критические ошибки
- `error` - ошибки
- `warn` - предупреждения
- `info` - информационные сообщения (по умолчанию)
- `debug` - отладочная информация
- `trace` - детальная трассировка

## Полезные команды

```bash
# Просмотр доступных скриптов
npm run

# Запуск в режиме отладки
npm run start:debug

# Запуск Prisma Studio (GUI для базы данных)
npm run prisma:studio

# Проверка lint
npm run lint:check

# Исправление lint ошибок
npm run lint
```
