# Backend разработка

## 🎯 Цель

Научиться разрабатывать API и backend функциональность в Avatar Generator.

## ⏱️ Время изучения

**45 минут**

## 📋 Предварительные знания

- [Структура проекта](02-project-structure.md) - понимание архитектуры
- Базовые знания NestJS
- Понимание TypeScript
- Опыт работы с REST API

## 🏗️ Архитектура Backend

```
┌─────────────────────────────────────────────────┐
│                NestJS Application               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌────────────┐  ┌─────────┐ │
│  │ Controllers │  │  Services  │  │ Modules │ │
│  │ (REST API)  │  │ (Business) │  │ (DI)    │ │
│  └──────┬──────┘  └─────┬──────┘  └─────────┘ │
│         │                │                     │
│         ↓                ↓                     │
│  ┌─────────────┐  ┌────────────┐              │
│  │   DTOs      │  │ Database   │              │
│  │ (Validation)│  │ (TypeORM)  │              │
│  └─────────────┘  └─────┬──────┘              │
│                         │                     │
│                         ↓                     │
│  ┌─────────────────────────┐                  │
│  │  SQLite / PostgreSQL    │                  │
│  └─────────────────────────┘                  │
└─────────────────────────────────────────────────┘
```

## 🎨 Avatar Module

### Controller (REST API)

```typescript
// src/modules/avatar/avatar.controller.ts
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { GenerateAvatarDto } from './dto/generate-avatar.dto';

@Controller('api')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Post('generate')
  async generate(@Body() generateAvatarDto: GenerateAvatarDto) {
    return await this.avatarService.generate(generateAvatarDto);
  }

  @Get('list')
  async list(@Query('pick') pick?: number, @Query('offset') offset?: number) {
    return await this.avatarService.list(pick, offset);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Query('size') size?: number,
    @Query('filter') filter?: string,
  ) {
    return await this.avatarService.getById(id, size, filter);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.avatarService.delete(id);
  }
}
```

### Service (Business Logic)

```typescript
// src/modules/avatar/avatar.service.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Avatar } from '../entities/avatar.entity';
import { GeneratorService } from './modules/generator/generator.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(Avatar)
    private avatarRepository: Repository<Avatar>,
    private generatorService: GeneratorService,
    private storageService: StorageService,
  ) {}

  async generate(dto: GenerateAvatarDto): Promise<Avatar> {
    // 1. Генерируем изображение
    const avatarObject = await this.generatorService.generate(dto);

    // 2. Сохраняем файл
    const filePath = await this.storageService.save(avatarObject);

    // 3. Сохраняем в БД
    const avatar = this.avatarRepository.create({
      name: avatarObject.meta_data_name,
      filePath,
      primaryColor: dto.primaryColor,
      foreignColor: dto.foreignColor,
      colorScheme: dto.colorScheme,
      seed: dto.seed,
    });

    return await this.avatarRepository.save(avatar);
  }

  async getById(id: string, size?: number, filter?: string): Promise<Buffer> {
    // 1. Получаем из БД
    const avatar = await this.avatarRepository.findOne({ where: { id } });
    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }

    // 2. Загружаем файл
    const avatarObject = await this.storageService.load(avatar.filePath);

    // 3. Извлекаем нужный размер
    const imageBuffer = this.extractImageSize(avatarObject, size);

    // 4. Применяем фильтр
    if (filter) {
      return await this.generatorService.applyFilter(imageBuffer, filter);
    }

    return imageBuffer;
  }

  private extractImageSize(avatarObject: AvatarObject, size?: number): Buffer {
    const sizeKey = size ? `image_${size}n` : 'image_6n';
    return avatarObject[sizeKey];
  }
}
```

### DTO (Data Transfer Objects)

```typescript
// src/modules/avatar/dto/generate-avatar.dto.ts
import { IsOptional, IsString, MaxLength, IsHexColor } from 'class-validator';

export class GenerateAvatarDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  seed?: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  foreignColor?: string;

  @IsOptional()
  @IsString()
  colorScheme?: string;
}
```

## 🗄️ Database Module

### Entity

```typescript
// src/modules/avatar/entities/avatar.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('avatars')
export class Avatar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: '0.0.1' })
  version: string;

  @Column({ unique: true })
  filePath: string;

  @Column({ nullable: true })
  primaryColor?: string;

  @Column({ nullable: true })
  foreignColor?: string;

  @Column({ nullable: true })
  colorScheme?: string;

  @Column({ nullable: true })
  seed?: string;
}
```

### Database Service

```typescript
// src/modules/database/database.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private dataSource: DataSource) {}

  async isConnected(): Promise<boolean> {
    return this.dataSource.isInitialized;
  }

  async getConnectionInfo(): Promise<any> {
    const driver = this.dataSource.driver;
    return {
      type: driver.options.type,
      host: driver.options.host,
      port: driver.options.port,
      database: driver.options.database,
    };
  }
}
```

## 🎨 Generator Module

### Generator Service

```typescript
// src/modules/avatar/modules/generator/generator.service.ts
import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GeneratorService {
  async generate(dto: GenerateAvatarDto): Promise<AvatarObject> {
    const seed = dto.seed || uuidv4();
    const colors = this.getColors(dto);

    // Генерируем изображения всех размеров
    const avatarObject: AvatarObject = {
      meta_data_name: uuidv4(),
      meta_data_created_at: new Date(),
      image_5n: await this.generateImage(32, colors, seed),
      image_6n: await this.generateImage(64, colors, seed),
      image_7n: await this.generateImage(128, colors, seed),
      image_8n: await this.generateImage(256, colors, seed),
      image_9n: await this.generateImage(512, colors, seed),
    };

    return avatarObject;
  }

  private async generateImage(
    size: number,
    colors: any,
    seed: string,
  ): Promise<Buffer> {
    // Генерация SVG
    const svg = this.generateSVG(size, colors, seed);

    // Конвертация в PNG
    return await sharp(Buffer.from(svg)).png().toBuffer();
  }

  private generateSVG(size: number, colors: any, seed: string): string {
    // Генерация SVG на основе seed
    // Это упрощенный пример, реальная реализация сложнее
    return `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${colors.primary}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="${colors.foreign}"/>
      </svg>
    `;
  }

  private getColors(dto: GenerateAvatarDto): {
    primary: string;
    foreign: string;
  } {
    if (dto.primaryColor && dto.foreignColor) {
      return {
        primary: dto.primaryColor,
        foreign: dto.foreignColor,
      };
    }

    if (dto.colorScheme) {
      return this.getColorScheme(dto.colorScheme);
    }

    return this.getRandomColors();
  }

  private getColorScheme(scheme: string): { primary: string; foreign: string } {
    const schemes = {
      pastel: { primary: '#FFB3BA', foreign: '#BAFFC9' },
      vibrant: { primary: '#FF6B6B', foreign: '#4ECDC4' },
      monochrome: { primary: '#2C3E50', foreign: '#ECF0F1' },
    };

    return schemes[scheme] || schemes.pastel;
  }

  async applyFilter(imageBuffer: Buffer, filter: string): Promise<Buffer> {
    let sharpInstance = sharp(imageBuffer);

    switch (filter) {
      case 'grayscale':
        sharpInstance = sharpInstance.grayscale();
        break;
      case 'sepia':
        sharpInstance = sharpInstance.sepia();
        break;
      case 'negative':
        sharpInstance = sharpInstance.negate();
        break;
    }

    return await sharpInstance.png().toBuffer();
  }
}
```

## 📁 Storage Module

### Storage Service

```typescript
// src/modules/storage/storage.service.ts
import { Injectable } from '@nestjs/common';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class StorageService {
  private readonly storagePath: string;

  constructor() {
    this.storagePath = process.env.STORAGE_PATH || './storage/avatars';
  }

  async save(avatarObject: AvatarObject): Promise<string> {
    const fileName = `${avatarObject.meta_data_name}.obj`;
    const filePath = join(this.storagePath, fileName);

    // Сериализуем объект в Buffer
    const buffer = Buffer.from(JSON.stringify(avatarObject));

    // Сохраняем файл
    await writeFile(filePath, buffer);

    return filePath;
  }

  async load(filePath: string): Promise<AvatarObject> {
    const buffer = await readFile(filePath);
    const jsonString = buffer.toString();

    // Десериализуем объект
    const avatarObject = JSON.parse(jsonString);

    // Конвертируем строки обратно в Buffer
    for (const key in avatarObject) {
      if (key.startsWith('image_')) {
        avatarObject[key] = Buffer.from(avatarObject[key].data);
      }
    }

    return avatarObject;
  }

  async delete(filePath: string): Promise<void> {
    await unlink(filePath);
  }
}
```

## 🔧 Configuration Module

### YAML Configuration Service

```typescript
// src/config/yaml-config.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

@Injectable()
export class YamlConfigService {
  private config: any;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const configPath = process.env.CONFIG_PATH || './settings.yaml';
    const configFile = fs.readFileSync(configPath, 'utf8');
    this.config = yaml.load(configFile);
  }

  get<T = any>(key: string): T {
    return this.getNestedValue(this.config, key);
  }

  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => o && o[k], obj);
  }
}
```

## 🧪 Testing

### Unit Tests

```typescript
// src/modules/avatar/avatar.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AvatarService } from './avatar.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Avatar } from './entities/avatar.entity';

describe('AvatarService', () => {
  let service: AvatarService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
        {
          provide: getRepositoryToken(Avatar),
          useValue: mockRepository,
        },
        {
          provide: 'GeneratorService',
          useValue: {
            generate: jest.fn(),
          },
        },
        {
          provide: 'StorageService',
          useValue: {
            save: jest.fn(),
            load: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AvatarService>(AvatarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate avatar', async () => {
    const dto = { seed: 'test' };
    const expectedAvatar = { id: 'uuid', name: 'test' };

    mockRepository.create.mockReturnValue(expectedAvatar);
    mockRepository.save.mockResolvedValue(expectedAvatar);

    const result = await service.generate(dto);

    expect(result).toEqual(expectedAvatar);
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
```

### E2E Tests

```typescript
// test/avatar.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Avatar (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/generate (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/generate')
      .send({ seed: 'test' })
      .expect(201)
      .expect(res => {
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.createdAt).toBeDefined();
      });
  });

  it('/api/:id (GET)', async () => {
    // Сначала создаем аватар
    const createResponse = await request(app.getHttpServer())
      .post('/api/generate')
      .send({ seed: 'test' });

    const avatarId = createResponse.body.data.id;

    // Затем получаем его
    return request(app.getHttpServer())
      .get(`/api/${avatarId}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toBeInstanceOf(Buffer);
      });
  });
});
```

## 🚀 API Endpoints

### POST /api/generate

**Описание:** Генерация нового аватара

**Тело запроса:**

```json
{
  "seed": "john_doe",
  "primaryColor": "#FF0000",
  "foreignColor": "#00FF00",
  "colorScheme": "pastel"
}
```

**Ответ:**

```json
{
  "statusCode": 201,
  "message": "Avatar generated successfully",
  "data": {
    "id": "uuid-here",
    "createdAt": "2025-01-15T12:00:00.000Z",
    "version": "0.0.1"
  }
}
```

### GET /api/list

**Описание:** Получение списка аватаров с пагинацией

**Параметры запроса:**

- `pick` (number, optional): Количество записей (1-100, default: 10)
- `offset` (number, optional): Смещение (default: 0)

**Ответ:**

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

### GET /api/:id

**Описание:** Получение аватара по ID

**Параметры запроса:**

- `size` (number, optional): Размер 2^n (5-9, default: 6)
- `filter` (string, optional): Фильтр (grayscale, sepia, negative)

**Ответ:** Binary image data (PNG)

### DELETE /api/:id

**Описание:** Удаление аватара

**Ответ:**

```json
{
  "statusCode": 200,
  "message": "Avatar deleted successfully"
}
```

## ✅ Проверка знаний

После изучения backend разработки вы должны уметь:

- [ ] Создавать NestJS модули и сервисы
- [ ] Работать с TypeORM и базой данных
- [ ] Создавать REST API endpoints
- [ ] Валидировать входные данные с DTO
- [ ] Обрабатывать ошибки
- [ ] Писать unit и E2E тесты
- [ ] Использовать dependency injection

## 🔗 Связанные темы

### Предварительные знания

- [Структура проекта](02-project-structure.md) - архитектура backend
- [NestJS документация](https://docs.nestjs.com/) - фреймворк
- [TypeORM документация](https://typeorm.io/) - ORM

### Следующие шаги

- [Frontend разработка](04-frontend-development.md) - интеграция с frontend
- [Добавление функций](05-adding-features.md) - новые возможности
- [Тестирование](07-testing.md) - углубленное тестирование

---

**Предыдущий раздел:** [Структура проекта](02-project-structure.md)  
**Следующий раздел:** [Frontend разработка](04-frontend-development.md)  
**Версия:** 1.0  
**Обновлено:** 2025-01-15
