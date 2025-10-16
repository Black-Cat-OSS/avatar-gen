# API Reference

## 🎯 Обзор

Avatar Generator предоставляет REST API для генерации, управления и получения
аватаров.

## 🌐 Базовый URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
Gateway: https://localhost:12745/api
```

## 🔐 Аутентификация

В настоящее время API не требует аутентификации. В будущих версиях планируется
добавить API ключи для production использования.

## 📋 Общие заголовки

```http
Content-Type: application/json
Accept: application/json
```

## 🎨 Генерация аватаров

### POST /generate

Создает новый аватар на основе переданных параметров.

**Тело запроса:**

```json
{
  "seed": "john_doe",
  "primaryColor": "#FF0000",
  "foreignColor": "#00FF00",
  "colorScheme": "pastel"
}
```

**Параметры:**

- `seed` (string, optional): Строка для генерации аватара. Если не указана,
  генерируется случайная UUID
- `primaryColor` (string, optional): Основной цвет в формате HEX (#RRGGBB)
- `foreignColor` (string, optional): Дополнительный цвет в формате HEX (#RRGGBB)
- `colorScheme` (string, optional): Предустановленная цветовая схема

**Доступные цветовые схемы:**

- `pastel` - Мягкие пастельные цвета
- `vibrant` - Яркие контрастные цвета
- `monochrome` - Черно-белая схема

**Ответ (201 Created):**

```json
{
  "statusCode": 201,
  "message": "Avatar generated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Пример запроса:**

```bash
curl -X POST https://localhost:12745/api/generate \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "seed": "my_username",
    "colorScheme": "vibrant"
  }'
```

## 📋 Список аватаров

### GET /list

Получает список всех созданных аватаров с пагинацией.

**Параметры запроса:**

- `pick` (number, optional): Количество записей (1-100, default: 10)
- `offset` (number, optional): Смещение для пагинации (default: 0)

**Ответ (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Avatar list retrieved successfully",
  "data": {
    "avatars": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "550e8400-e29b-41d4-a716-446655440000",
        "createdAt": "2025-01-15T12:00:00.000Z",
        "version": "0.0.1",
        "primaryColor": "#FF0000",
        "foreignColor": "#00FF00",
        "colorScheme": "vibrant",
        "seed": "my_username"
      }
    ],
    "pagination": {
      "total": 150,
      "offset": 0,
      "pick": 10,
      "hasMore": true
    }
  }
}
```

**Пример запроса:**

```bash
curl "https://localhost:12745/api/list?pick=20&offset=0" -k
```

## 🖼️ Получение аватара

### GET /:id

Получает аватар по ID в виде изображения.

**Параметры запроса:**

- `size` (number, optional): Размер изображения как степень двойки (5-9,
  default: 6)
  - `5` = 32x32 пикселей
  - `6` = 64x64 пикселей (по умолчанию)
  - `7` = 128x128 пикселей
  - `8` = 256x256 пикселей
  - `9` = 512x512 пикселей
- `filter` (string, optional): Фильтр для изображения
  - `grayscale` - Черно-белый эффект
  - `sepia` - Сепия эффект
  - `negative` - Негативный эффект

**Ответ (200 OK):** Binary image data (PNG)

**Примеры запросов:**

```bash
# Базовое получение аватара (64x64)
curl "https://localhost:12745/api/550e8400-e29b-41d4-a716-446655440000" -k -o avatar.png

# Получение аватара размером 128x128
curl "https://localhost:12745/api/550e8400-e29b-41d4-a716-446655440000?size=7" -k -o avatar_128.png

# Получение аватара с фильтром сепия
curl "https://localhost:12745/api/550e8400-e29b-41d4-a716-446655440000?filter=sepia" -k -o avatar_sepia.png

# Комбинирование параметров
curl "https://localhost:12745/api/550e8400-e29b-41d4-a716-446655440000?size=8&filter=grayscale" -k -o avatar_256_gray.png
```

## 🗑️ Удаление аватара

### DELETE /:id

Удаляет аватар по ID.

**Ответ (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Avatar deleted successfully"
}
```

**Ответ (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Avatar not found"
}
```

**Пример запроса:**

```bash
curl -X DELETE "https://localhost:12745/api/550e8400-e29b-41d4-a716-446655440000" -k
```

## 🎨 Цветовые схемы

### GET /color-schemes

Получает список доступных цветовых схем.

**Ответ (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Color schemes retrieved successfully",
  "data": {
    "schemes": [
      {
        "name": "pastel",
        "displayName": "Pastel",
        "description": "Мягкие пастельные цвета",
        "primaryColor": "#FFB3BA",
        "foreignColor": "#BAFFC9"
      },
      {
        "name": "vibrant",
        "displayName": "Vibrant",
        "description": "Яркие контрастные цвета",
        "primaryColor": "#FF6B6B",
        "foreignColor": "#4ECDC4"
      },
      {
        "name": "monochrome",
        "displayName": "Monochrome",
        "description": "Черно-белая схема",
        "primaryColor": "#2C3E50",
        "foreignColor": "#ECF0F1"
      }
    ]
  }
}
```

**Пример запроса:**

```bash
curl "https://localhost:12745/api/color-schemes" -k
```

## 💚 Health Check

### GET /health

Проверяет состояние API и подключенных сервисов.

**Ответ (200 OK):**

```json
{
  "statusCode": 200,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2025-01-15T12:00:00.000Z",
    "uptime": 3600,
    "version": "3.1.0",
    "services": {
      "database": {
        "status": "connected",
        "type": "sqlite"
      },
      "storage": {
        "status": "available",
        "type": "local"
      }
    }
  }
}
```

**Пример запроса:**

```bash
curl "https://localhost:12745/api/health" -k
```

## ❌ Коды ошибок

### 400 Bad Request

Некорректные параметры запроса.

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "seed",
      "message": "seed must be shorter than or equal to 32 characters"
    }
  ]
}
```

### 404 Not Found

Аватар не найден.

```json
{
  "statusCode": 404,
  "message": "Avatar not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error

Внутренняя ошибка сервера.

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## 🔄 Rate Limiting

В текущей версии rate limiting не реализован. В будущих версиях планируется
добавить ограничения:

- 100 запросов в минуту для генерации аватаров
- 1000 запросов в минуту для получения аватаров

## 📊 Примеры использования

### JavaScript/TypeScript

```typescript
// Генерация аватара
async function generateAvatar(seed: string) {
  const response = await fetch('https://localhost:12745/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      seed,
      colorScheme: 'vibrant',
    }),
  });

  const data = await response.json();
  return data.data.id;
}

// Получение аватара
async function getAvatar(id: string, size: number = 6) {
  const response = await fetch(
    `https://localhost:12745/api/${id}?size=${size}`,
  );
  return response.blob();
}

// Использование
const avatarId = await generateAvatar('john_doe');
const avatarBlob = await getAvatar(avatarId, 7);
const avatarUrl = URL.createObjectURL(avatarBlob);
```

### Python

```python
import requests

# Генерация аватара
def generate_avatar(seed):
    response = requests.post('https://localhost:12745/api/generate',
                           json={'seed': seed, 'colorScheme': 'vibrant'},
                           verify=False)
    return response.json()['data']['id']

# Получение аватара
def get_avatar(avatar_id, size=6):
    response = requests.get(f'https://localhost:12745/api/{avatar_id}?size={size}',
                          verify=False)
    return response.content

# Использование
avatar_id = generate_avatar('john_doe')
avatar_data = get_avatar(avatar_id, 7)
with open('avatar.png', 'wb') as f:
    f.write(avatar_data)
```

### PHP

```php
<?php
// Генерация аватара
function generateAvatar($seed) {
    $data = [
        'seed' => $seed,
        'colorScheme' => 'vibrant'
    ];

    $response = file_get_contents('https://localhost:12745/api/generate', false,
        stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => 'Content-Type: application/json',
                'content' => json_encode($data)
            ]
        ])
    );

    $result = json_decode($response, true);
    return $result['data']['id'];
}

// Получение аватара
function getAvatar($id, $size = 6) {
    $url = "https://localhost:12745/api/{$id}?size={$size}";
    return file_get_contents($url);
}

// Использование
$avatarId = generateAvatar('john_doe');
$avatarData = getAvatar($avatarId, 7);
file_put_contents('avatar.png', $avatarData);
?>
```

## 🔗 Связанные ресурсы

- [Swagger UI](http://localhost:3000/swagger) - Интерактивная документация API
- [Postman Collection](https://github.com/letnull19A/avatar-gen/tree/main/docs/api/postman) -
  Готовые запросы для тестирования
- [SDK и библиотеки](../../api/sdks.md) - Клиентские библиотеки

---

**Версия API:** 3.1  
**Последнее обновление:** 2025-01-15  
**Автор:** Avatar Generator Team
