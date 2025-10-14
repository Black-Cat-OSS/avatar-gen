import { Test, TestingModule } from '@nestjs/testing';
import { LocalStorageService } from '../local-storage.service';
import { YamlConfigService } from '../../../../../config/modules/yaml-driver/yaml-config.service';
import * as fs from 'fs';
import * as path from 'path';

describe('LocalStorageService Integration Tests', () => {
  let service: LocalStorageService;
  let configService: YamlConfigService;
  let testDir: string;

  beforeAll(async () => {
    testDir = path.join(__dirname, '../../../../../storage/test-integration');
    
    // Ensure test directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  beforeEach(async () => {
    const mockConfigService = {
      getStorageConfig: () => ({
        type: 'local',
        local: {
          save_path: testDir,
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LocalStorageService,
          useFactory: (configService: YamlConfigService) => {
            return new LocalStorageService(configService);
          },
          inject: [YamlConfigService],
        },
        {
          provide: YamlConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LocalStorageService>(LocalStorageService);
    configService = module.get<YamlConfigService>(YamlConfigService);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testDir, file));
      });
    }
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should save and load avatar with real file system', async () => {
    const mockAvatar = {
      meta_data_name: 'integration-test-avatar',
      meta_data_created_at: new Date('2025-01-01'),
      image_4n: Buffer.from([1, 2, 3, 4]),
      image_5n: Buffer.from([5, 6, 7, 8]),
      image_6n: Buffer.from([9, 10, 11, 12]),
      image_7n: Buffer.from([13, 14, 15, 16]),
      image_8n: Buffer.from([17, 18, 19, 20]),
      image_9n: Buffer.from([21, 22, 23, 24]),
    };

    // Save avatar
    const savedPath = await service.saveAvatar(mockAvatar);
    expect(savedPath).toContain('integration-test-avatar.obj');
    expect(fs.existsSync(savedPath)).toBe(true);

    // Load avatar
    const loadedAvatar = await service.loadAvatar('integration-test-avatar');
    expect(loadedAvatar.meta_data_name).toBe('integration-test-avatar');
    expect(loadedAvatar.image_4n).toEqual(mockAvatar.image_4n);

    // Check if file exists
    expect(await service.exists('integration-test-avatar')).toBe(true);

    // Delete avatar
    await service.deleteAvatar('integration-test-avatar');
    expect(await service.exists('integration-test-avatar')).toBe(false);
    expect(fs.existsSync(savedPath)).toBe(false);
  });

  it('should create directory if it does not exist', async () => {
    const nonExistentDir = path.join(testDir, 'non-existent');
    const mockConfigService = {
      getStorageConfig: () => ({
        type: 'local',
        local: {
          save_path: nonExistentDir,
        },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LocalStorageService,
          useFactory: (configService: YamlConfigService) => {
            return new LocalStorageService(configService);
          },
          inject: [YamlConfigService],
        },
        {
          provide: YamlConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    const serviceWithNonExistentDir = module.get<LocalStorageService>(LocalStorageService);

    const mockAvatar = {
      meta_data_name: 'directory-test-avatar',
      meta_data_created_at: new Date(),
      image_4n: Buffer.from([1, 2, 3, 4]),
      image_5n: Buffer.from([5, 6, 7, 8]),
      image_6n: Buffer.from([9, 10, 11, 12]),
      image_7n: Buffer.from([13, 14, 15, 16]),
      image_8n: Buffer.from([17, 18, 19, 20]),
      image_9n: Buffer.from([21, 22, 23, 24]),
    };

    // Directory should not exist initially
    expect(fs.existsSync(nonExistentDir)).toBe(false);

    // Save should create directory
    await serviceWithNonExistentDir.saveAvatar(mockAvatar);
    expect(fs.existsSync(nonExistentDir)).toBe(true);

    // Clean up
    fs.rmSync(nonExistentDir, { recursive: true, force: true });
  });
});
