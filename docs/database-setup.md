# Настройка базы данных

Этот документ описывает настройку и использование различных типов баз данных в проекте Avatar Generator.

## Поддерживаемые базы данных

- **SQLite** - По умолчанию, для разработки и небольших развертываний
- **PostgreSQL** - Для продакшена и больших нагрузок

## Конфигурация

### Переменные окружения

```bash
# Тип базы данных
DATABASE_PROVIDER="sqlite"  # или "postgresql"

# URL подключения к базе данных
DATABASE_URL="file:./prisma/storage/database.sqlite"  # для SQLite
# или
DATABASE_URL="postgresql://username:password@host:port/database"  # для PostgreSQL
```

### Файл settings.yaml

```yaml
app:
  database:
    driver: 'sqlite' # или "postgresql"
    connection:
      maxRetries: 3 # Количество попыток подключения
      retryDelay: 2000 # Задержка между попытками (мс)
    sqlite_params:
      url: 'file:./prisma/storage/database.sqlite'
    postgresql_params:
      host: 'localhost'
      port: 5432
      database: 'avatar_gen'
      username: 'postgres'
      password: 'password'
      ssl: false
```

## SQLite

### Преимущества

- Файловая база данных
- Не требует дополнительной настройки
- Идеально для разработки
- Быстрое развертывание

### Настройка

1. Убедитесь, что `DATABASE_PROVIDER="sqlite"`
2. Проверьте путь к файлу базы данных в `DATABASE_URL`
3. Запустите миграции: `npm run prisma:migrate`

### Использование

```bash
# Переключение на SQLite
npm run db:switch:sqlite

# Генерация клиента Prisma
npm run prisma:generate

# Запуск миграций
npm run prisma:migrate

# Проверка состояния БД
npm run db:health
```

## PostgreSQL

### Преимущества

- Полнофункциональная реляционная БД
- Лучшая производительность для продакшена
- Поддержка транзакций и ACID
- Масштабируемость

### Настройка

#### 1. Установка PostgreSQL

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (с Homebrew):**

```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Скачайте и установите с официального сайта PostgreSQL.

#### 2. Создание базы данных

```bash
# Подключение к PostgreSQL
sudo -u postgres psql

# Создание базы данных
CREATE DATABASE avatar_gen;

# Создание пользователя (опционально)
CREATE USER avatar_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE avatar_gen TO avatar_user;

# Выход
\q
```

#### 3. Настройка приложения

```bash
# Переключение на PostgreSQL
npm run db:switch:postgresql

# Обновление переменных окружения
export DATABASE_PROVIDER="postgresql"
export DATABASE_URL="postgresql://postgres:password@localhost:5432/avatar_gen"

# Генерация клиента Prisma
npm run prisma:generate

# Запуск миграций
npm run prisma:migrate
```

### Docker с PostgreSQL

```bash
# Запуск PostgreSQL в Docker
docker-compose up postgres

# Переключение на PostgreSQL
npm run db:switch:postgresql

# Запуск приложения
npm run start:dev
```

## Система повторных попыток подключения

### Конфигурация

```yaml
database:
  connection:
    maxRetries: 3 # Максимальное количество попыток
    retryDelay: 2000 # Задержка между попытками (мс)
```

### Поведение

1. При запуске приложения система пытается подключиться к БД
2. При неудаче ждет `retryDelay` миллисекунд
3. Повторяет попытку до `maxRetries` раз
4. При исчерпании попыток приложение завершается с ошибкой

### Логирование

```
[DatabaseService] Database connection attempt 1 failed
[DatabaseService] Retrying database connection in 2000ms... (1/3)
[DatabaseService] Database connection attempt 2 failed
[DatabaseService] Retrying database connection in 2000ms... (2/3)
[DatabaseService] Database connected successfully on attempt 3
```

## Проверка состояния базы данных

### Команда health check

```bash
npm run db:health
```

### API endpoint

```bash
curl http://localhost:3000/api/health
```

### Программная проверка

```typescript
const isHealthy = await databaseService.healthCheck();
const dbInfo = databaseService.getDatabaseInfo();
```

## Миграции

### Разработка

```bash
# Создание новой миграции
npx prisma migrate dev --name migration_name

# Применение миграций
npm run prisma:migrate

# Сброс базы данных (только для разработки!)
npm run prisma:reset
```

### Продакшен

```bash
# Применение миграций без интерактивности
npm run prisma:deploy
```

## Резервное копирование

### SQLite

```bash
# Копирование файла базы данных
cp prisma/storage/database.sqlite backup/database_$(date +%Y%m%d_%H%M%S).sqlite
```

### PostgreSQL

```bash
# Создание дампа
pg_dump -h localhost -U postgres avatar_gen > backup/avatar_gen_$(date +%Y%m%d_%H%M%S).sql

# Восстановление из дампа
psql -h localhost -U postgres avatar_gen < backup/avatar_gen_backup.sql
```

## Мониторинг и отладка

### Логи подключения

Все попытки подключения логируются с уровнем INFO/ERROR:

```
[DatabaseService] Database connected successfully on attempt 1
[DatabaseService] Database connection attempt 2 failed: connect ECONNREFUSED
[DatabaseService] Retrying database connection in 2000ms... (2/3)
```

### Prisma Studio

```bash
# Открытие веб-интерфейса для управления БД
npm run prisma:studio
```

### Прямые запросы

```bash
# SQLite
sqlite3 prisma/storage/database.sqlite

# PostgreSQL
psql -h localhost -U postgres -d avatar_gen
```

## Troubleshooting

### Частые проблемы

1. **Connection refused (PostgreSQL)**
   - Убедитесь, что PostgreSQL запущен
   - Проверьте настройки хоста и порта
   - Проверьте файрвол

2. **Database file locked (SQLite)**
   - Убедитесь, что нет других процессов, использующих файл
   - Проверьте права доступа к файлу

3. **Migration failed**
   - Проверьте права доступа к БД
   - Убедитесь в корректности схемы Prisma
   - Проверьте существующие данные

### Полезные команды

```bash
# Проверка статуса PostgreSQL
sudo systemctl status postgresql

# Проверка подключения к PostgreSQL
pg_isready -h localhost -p 5432

# Проверка размера файла SQLite
ls -lh prisma/storage/database.sqlite

# Очистка логов
truncate -s 0 logs/dev-backend-*.log
```
