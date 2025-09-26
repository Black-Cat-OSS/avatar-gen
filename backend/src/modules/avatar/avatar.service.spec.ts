import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { DatabaseService } from '../database/database.service';
import { AvatarGeneratorService } from './avatar-generator.service';
import { AvatarStorageService } from './avatar-storage.service';
import { FilterType } from '../../common/enums/filter.enum';

describe('AvatarService', () => {
  let service: AvatarService;
  let databaseService: jest.Mocked<DatabaseService>;
  let avatarGenerator: jest.Mocked<AvatarGeneratorService>;
  let avatarStorage: jest.Mocked<AvatarStorageService>;

  const mockAvatar = {
    id: 'test-id',
    name: 'test-name',
    createdAt: new Date(),
    version: '0.0.1',
    filePath: '/test/path',
    primaryColor: 'blue',
    foreignColor: 'lightblue',
    colorScheme: null,
    seed: null,
  };

  const mockAvatarObject = {
    meta_data_name: 'test-id',
    meta_data_created_at: new Date(),
    image_4n: Buffer.from('test'),
    image_5n: Buffer.from('test'),
    image_6n: Buffer.from('test'),
    image_7n: Buffer.from('test'),
    image_8n: Buffer.from('test'),
    image_9n: Buffer.from('test'),
  };

  beforeEach(async () => {
    const mockDatabaseService = {
      avatar: {
        create: jest.fn().mockResolvedValue(mockAvatar),
        findUnique: jest.fn().mockResolvedValue(mockAvatar),
        delete: jest.fn().mockResolvedValue(mockAvatar),
      },
      healthCheck: jest.fn().mockResolvedValue(true),
    };

    const mockAvatarGenerator = {
      generateAvatar: jest.fn(),
      applyFilter: jest.fn(),
      getColorSchemes: jest.fn(),
    };

    const mockAvatarStorage = {
      saveAvatar: jest.fn(),
      loadAvatar: jest.fn(),
      deleteAvatar: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: AvatarGeneratorService,
          useValue: mockAvatarGenerator,
        },
        {
          provide: AvatarStorageService,
          useValue: mockAvatarStorage,
        },
      ],
    }).compile();

    service = module.get<AvatarService>(AvatarService);
    databaseService = module.get(DatabaseService);
    avatarGenerator = module.get(AvatarGeneratorService);
    avatarStorage = module.get(AvatarStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAvatar', () => {
    it('should generate avatar successfully', async () => {
      avatarGenerator.generateAvatar.mockResolvedValue(mockAvatarObject);
      avatarStorage.saveAvatar.mockResolvedValue('/test/path');

      const result = await service.generateAvatar({
        primaryColor: 'blue',
        foreignColor: 'lightblue',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(mockAvatar.id);
      expect(avatarGenerator.generateAvatar).toHaveBeenCalled();
      expect(avatarStorage.saveAvatar).toHaveBeenCalled();
      expect(databaseService.avatar.create).toHaveBeenCalled();
    });

    it('should throw error for seed longer than 32 characters', async () => {
      const longSeed = 'a'.repeat(33);
      
      await expect(
        service.generateAvatar({ seed: longSeed })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAvatar', () => {
    it('should get avatar successfully', async () => {
      avatarStorage.loadAvatar.mockResolvedValue(mockAvatarObject);
      avatarGenerator.applyFilter.mockResolvedValue(Buffer.from('filtered'));

      const result = await service.getAvatar('test-id', {
        filter: FilterType.GRAYSCALE,
        size: 6,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(mockAvatar.id);
      expect(avatarGenerator.applyFilter).toHaveBeenCalled();
    });

    it('should throw error for invalid size', async () => {
      await expect(
        service.getAvatar('test-id', { size: 3 })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for size greater than 9', async () => {
      await expect(
        service.getAvatar('test-id', { size: 10 })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when avatar not found', async () => {
      (databaseService.avatar.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.getAvatar('non-existent-id', {})
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar successfully', async () => {
      avatarStorage.deleteAvatar.mockResolvedValue(undefined);

      const result = await service.deleteAvatar('test-id');

      expect(result).toBeDefined();
      expect(result.message).toBe('Avatar deleted successfully');
      expect(avatarStorage.deleteAvatar).toHaveBeenCalled();
      expect(databaseService.avatar.delete).toHaveBeenCalled();
    });

    it('should throw error when avatar not found', async () => {
      (databaseService.avatar.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        service.deleteAvatar('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getColorSchemes', () => {
    it('should return color schemes', async () => {
      const mockSchemes = [
        { name: 'green', primaryColor: 'green', foreignColor: 'lightgreen' },
      ];
      avatarGenerator.getColorSchemes.mockReturnValue(mockSchemes);

      const result = await service.getColorSchemes();

      expect(result).toEqual(mockSchemes);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status', async () => {
      const result = await service.healthCheck();

      expect(result).toEqual({
        database: true,
        status: 'healthy',
      });
    });

    it('should return unhealthy status', async () => {
      (databaseService.healthCheck as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.healthCheck();

      expect(result).toEqual({
        database: false,
        status: 'unhealthy',
      });
    });
  });
});

