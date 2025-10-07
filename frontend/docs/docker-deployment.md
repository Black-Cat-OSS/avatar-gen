# Docker Deployment Guide

Руководство по развертыванию React SDK приложения с помощью Docker и nginx.

## Структура Docker файлов

- `docker/Dockerfile` - Многоэтапная сборка приложения с nginx
- `configs/nginx/nginx.conf` - Конфигурация nginx веб-сервера
- `static/403.html`, `static/404.html`, `static/50x.html` - Кастомные страницы
  ошибок

## Быстрый старт

### Сборка и запуск

```bash
# Сборка образа (версия извлекается из package.json)
docker build -f docker/Dockerfile -t react-sdk:0.0.1 -t react-sdk:latest .

# Запуск контейнера с монтированием nginx конфигурации
docker run -d \
  --name react-sdk-app \
  -p 8080:8080 \
  --restart unless-stopped \
  -v "$(pwd)/configs/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
  react-sdk:latest

# Остановка и удаление контейнера
docker stop react-sdk-app
docker rm react-sdk-app
```

## Особенности конфигурации

### Dockerfile

- **Многоэтапная сборка**: Отдельные этапы для сборки и production
- **Безопасность**: Запуск от непривилегированного пользователя
- **Оптимизация**: Минимальный размер образа за счет alpine
- **Health check**: Встроенная проверка здоровья приложения
- **Кастомные страницы ошибок**: 403.html, 404.html и 50x.html из директории
  static

### Nginx конфигурация

- **Gzip сжатие**: Оптимизация передачи данных
- **Кэширование**: Долгосрочное кэширование статических ресурсов
- **SPA поддержка**: Правильная обработка маршрутизации React Router
- **Безопасность**: Security headers и защита от скрытых файлов
- **Кастомные страницы ошибок**: 403.html, 404.html и 50x.html

## Работа с nginx конфигурацией

### Монтирование конфигурации

Nginx конфигурация монтируется из хоста в контейнер:

```bash
-v "$(pwd)/configs/nginx/nginx.conf:/etc/nginx/nginx.conf:ro"
```

### Изменение конфигурации

1. **Отредактируйте файл** `configs/nginx/nginx.conf`
2. **Перезагрузите nginx** без перезапуска контейнера:
   ```bash
   ./scripts/docker-build.sh reload
   ```

### Преимущества монтирования

- ✅ **Быстрые изменения** - не нужно пересобирать образ
- ✅ **Горячая перезагрузка** - nginx перезагружает конфигурацию
- ✅ **Версионирование** - конфигурация в git
- ✅ **Отладка** - легко тестировать разные настройки

## Версионирование образов

### Автоматическое извлечение версии

Скрипт автоматически извлекает версию из `package.json`:

```bash
VERSION=$(node -p "require('./package.json').version")
```

### Теги образов

При сборке создаются два тега:

- `react-sdk:0.0.1` - версионный тег
- `react-sdk:latest` - тег для последней версии

### Команды для работы с версиями

```bash
# Просмотр текущей версии
./scripts/docker-build.sh version

# Сборка с версионированием
./scripts/docker-build.sh build

# Просмотр всех образов
docker images react-sdk
```

## Переменные окружения

| Переменная | Описание          | По умолчанию |
| ---------- | ----------------- | ------------ |
| `NODE_ENV` | Окружение Node.js | `production` |

## Порты

- `8080` - HTTP порт приложения

## Health Check

Приложение доступно по адресу: `http://localhost:8080/health`

## Логи

```bash
# Просмотр логов
docker-compose logs -f react-app

# Просмотр логов nginx
docker exec react-sdk-app tail -f /var/log/nginx/access.log
docker exec react-sdk-app tail -f /var/log/nginx/error.log
```

## Мониторинг

```bash
# Статистика контейнера
docker stats react-sdk-app

# Информация о контейнере
docker inspect react-sdk-app
```

## Разработка

Для разработки рекомендуется использовать локальный dev сервер:

```bash
pnpm run dev
```

Docker конфигурация предназначена для production развертывания.
