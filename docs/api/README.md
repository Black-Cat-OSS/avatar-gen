# API Документация

Документация REST API Avatar Generator.

## 📚 Содержание

- **[Endpoints Reference](./endpoints.md)** 🟡 Создается  
  Подробное описание всех endpoints

- **[Usage Examples](./examples.md)** 🟡 Создается  
  Примеры использования API

## 🌐 Swagger UI

После запуска backend, интерактивная API документация доступна по адресу:

**http://localhost:3000/swagger**

## 📋 Endpoints

### Health Endpoints

| Endpoint           | Method | Описание                         |
| ------------------ | ------ | -------------------------------- |
| `/health`          | GET    | Базовая проверка здоровья        |
| `/health/detailed` | GET    | Детальная информация о состоянии |

### Avatar Endpoints

| Endpoint             | Method | Описание                         |
| -------------------- | ------ | -------------------------------- |
| `/api/generate`      | POST   | Генерация нового аватара         |
| `/api/list`          | GET    | Список аватаров с пагинацией     |
| `/api/color-schemes` | GET    | Доступные цветовые схемы         |
| `/api/:id`           | GET    | Получение аватара по ID          |
| `/api/:id`           | DELETE | Удаление аватара                 |
| `/api/health`        | GET    | Проверка здоровья Avatar сервиса |

## 🔍 Примеры использования

### Генерация аватара

```bash
# Базовая генерация
curl -X POST http://localhost:3000/api/generate

# С кастомными цветами
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "primaryColor": "#FF0000",
    "foreignColor": "#00FF00",
    "seed": "my-unique-seed"
  }'

# С цветовой схемой
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"colorScheme": "pastel"}'
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Avatar generated successfully",
  "data": {
    "id": "uuid-here",
    "createdAt": "2025-10-03T12:00:00.000Z",
    "version": "0.0.1"
  }
}
```

### Получение списка аватаров

```bash
# Первая страница (10 записей)
curl http://localhost:3000/api/list

# С пагинацией
curl "http://localhost:3000/api/list?pick=20&offset=10"
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Avatar list retrieved successfully",
  "data": {
    "avatars": [...],
    "pagination": {
      "total": 100,
      "offset": 10,
      "pick": 20,
      "hasMore": true
    }
  }
}
```

### Получение аватара

```bash
# Базовое получение
curl http://localhost:3000/api/{id} -o avatar.png

# С фильтром
curl "http://localhost:3000/api/{id}?filter=grayscale" -o avatar-gray.png

# С изменением размера
curl "http://localhost:3000/api/{id}?size=7" -o avatar-large.png

# Комбинация параметров
curl "http://localhost:3000/api/{id}?filter=sepia&size=8" -o avatar-sepia-xl.png
```

### Удаление аватара

```bash
curl -X DELETE http://localhost:3000/api/{id}
```

## 📊 Параметры

### POST /api/generate

| Параметр     | Тип    | Обязательный | Описание                            |
| ------------ | ------ | ------------ | ----------------------------------- |
| primaryColor | string | Нет          | Основной цвет (#RRGGBB)             |
| foreignColor | string | Нет          | Вторичный цвет (#RRGGBB)            |
| colorScheme  | string | Нет          | Название цветовой схемы             |
| seed         | string | Нет          | Seed для генерации (max 32 символа) |

### GET /api/list

| Параметр | Тип    | Обязательный | Описание                                |
| -------- | ------ | ------------ | --------------------------------------- |
| pick     | number | Нет          | Количество записей (1-100, default: 10) |
| offset   | number | Нет          | Смещение (default: 0)                   |

### GET /api/:id

| Параметр | Тип    | Обязательный | Описание                           |
| -------- | ------ | ------------ | ---------------------------------- |
| filter   | enum   | Нет          | Фильтр: grayscale, sepia, negative |
| size     | number | Нет          | Размер 2^n (5-9, default: 6)       |

## 🎨 Цветовые схемы

Получить список доступных схем:

```bash
curl http://localhost:3000/api/color-schemes
```

**Примеры схем:**

- `pastel` - Пастельные тона
- `vibrant` - Яркие цвета
- `monochrome` - Монохромная палитра
- `warm` - Теплые тона
- `cool` - Холодные тона

## ⚠️ Коды ошибок

| Код | Описание              | Причина              |
| --- | --------------------- | -------------------- |
| 200 | OK                    | Успешный запрос      |
| 201 | Created               | Аватар создан        |
| 400 | Bad Request           | Невалидные параметры |
| 404 | Not Found             | Аватар не найден     |
| 500 | Internal Server Error | Ошибка сервера       |

## 🔗 Детальная документация

- [Endpoints Reference](./endpoints.md) - Полное описание всех endpoints
- [Examples](./examples.md) - Больше примеров использования
- [Testing Guide](../testing/README.md) - Тестирование API

## 🔗 Связанные разделы

- [Backend Documentation](../../backend/docs/README.md)
- [Development Guide](../development/README.md)
- [Testing](../../backend/docs/TESTING.md)

---

**Обновлено:** 2025-10-03
