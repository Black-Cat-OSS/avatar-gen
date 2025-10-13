import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { vi } from 'vitest';
import { AvatarService } from './avatar.service';
import { Avatar } from './avatar.entity';
import { GeneratorService } from './modules';
import { StorageService } from '../storage/storage.service';
import {
  GenerateAvatarDto,
  GetAvatarDto,
  ListAvatarsDto,
} from '../../common/dto/generate-avatar.dto';
import { FilterType } from '../../common/enums/filter.enum';

describe('AvatarService', () => {
  let service: AvatarService;
  let avatarRepository: Repository<Avatar>;
  let generatorService: GeneratorService;
  let storageService: StorageService;

  const mockAvatarRepository = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    findAndCount: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
    remove: vi.fn(),
  };

  const mockGeneratorService = {
    generateAvatar: vi.fn(),
    applyFilter: vi.fn(),
    getColorSchemes: vi.fn(),
  };

  const mockStorageService = {
    saveAvatar: vi.fn(),
    loadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
    getStorageStats: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvatarService,
        {
          provide: getRepositoryToken(Avatar),
          useValue: mockAvatarRepository,
        },
        {
          provide: GeneratorService,
          useValue: mockGeneratorService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<AvatarService>(AvatarService);
    avatarRepository = module.get<Repository<Avatar>>(getRepositoryToken(Avatar));
    generatorService = module.get<GeneratorService>(GeneratorService);
    storageService = module.get<StorageService>(StorageService);

    // Reset mocks
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAvatar', () => {
    it('should generate avatar successfully', async () => {
      const dto: GenerateAvatarDto = {
        primaryColor: '#FF0000',
        foreignColor: '#00FF00',
        seed: 'test-seed',
      };

      const mockAvatarObject = {
        meta_data_name: 'test-uuid',
        image_6n: Buffer.from('image-data'),
      };

      const mockFilePath = '/path/to/avatar.png';
      const mockAvatar = {
        id: 'test-uuid',
        name: 'test-uuid',
        createdAt: new Date(),
        version: '0.0.1',
        filePath: mockFilePath,
        primaryColor: dto.primaryColor,
        foreignColor: dto.foreignColor,
        colorScheme: dto.colorScheme,
        seed: dto.seed,
      };

      mockGeneratorService.generateAvatar.mockResolvedValue(mockAvatarObject);
      mockStorageService.saveAvatar.mockResolvedValue(mockFilePath);
      mockAvatarRepository.create.mockReturnValue(mockAvatar);
      mockAvatarRepository.save.mockResolvedValue(mockAvatar);

      const result = await service.generateAvatar(dto);

      expect(result).toEqual({
        id: mockAvatar.id,
        createdAt: mockAvatar.createdAt,
        version: mockAvatar.version,
      });

      expect(mockGeneratorService.generateAvatar).toHaveBeenCalledWith(
        dto.primaryColor,
        dto.foreignColor,
        dto.colorScheme,
        dto.seed,
      );
      expect(mockStorageService.saveAvatar).toHaveBeenCalledWith(mockAvatarObject);
      expect(mockAvatarRepository.create).toHaveBeenCalledWith({
        id: mockAvatarObject.meta_data_name,
        name: mockAvatarObject.meta_data_name,
        filePath: mockFilePath,
        primaryColor: dto.primaryColor,
        foreignColor: dto.foreignColor,
        colorScheme: dto.colorScheme,
        seed: dto.seed,
      });
      expect(mockAvatarRepository.save).toHaveBeenCalledWith(mockAvatar);
    });

    it('should throw BadRequestException for seed longer than 32 characters', async () => {
      const dto: GenerateAvatarDto = {
        seed: 'a'.repeat(33), // 33 characters
      };

      await expect(service.generateAvatar(dto)).rejects.toThrow(BadRequestException);
      await expect(service.generateAvatar(dto)).rejects.toThrow(
        'Seed must not exceed 32 characters',
      );
    });

    it('should handle generation errors', async () => {
      const dto: GenerateAvatarDto = { seed: 'test' };

      mockGeneratorService.generateAvatar.mockRejectedValue(new Error('Generation failed'));

      await expect(service.generateAvatar(dto)).rejects.toThrow('Generation failed');
    });
  });

  describe('getAvatar', () => {
    it('should retrieve avatar successfully', async () => {
      const avatarId = 'test-uuid';
      const dto: GetAvatarDto = {};

      const mockAvatar = {
        id: avatarId,
        name: 'test-avatar',
        createdAt: new Date(),
        version: '0.0.1',
        filePath: '/path/to/avatar.png',
      };

      const mockAvatarObject = {
        meta_data_name: avatarId,
        image_6n: Buffer.from('image-data'),
      };

      mockAvatarRepository.findOne.mockResolvedValue(mockAvatar);
      mockStorageService.loadAvatar.mockResolvedValue(mockAvatarObject);

      const result = await service.getAvatar(avatarId, dto);

      expect(result).toMatchObject({
        id: mockAvatar.id,
        image: expect.any(Buffer),
        contentType: 'image/png',
        createdAt: mockAvatar.createdAt,
        version: mockAvatar.version,
      });

      expect(mockAvatarRepository.findOne).toHaveBeenCalledWith({
        where: { id: avatarId },
      });
      expect(mockStorageService.loadAvatar).toHaveBeenCalledWith(avatarId);
    });

    it('should throw NotFoundException when avatar not found', async () => {
      const avatarId = 'non-existent-uuid';
      const dto: GetAvatarDto = {};

      mockAvatarRepository.findOne.mockResolvedValue(null);

      await expect(service.getAvatar(avatarId, dto)).rejects.toThrow(NotFoundException);
      await expect(service.getAvatar(avatarId, dto)).rejects.toThrow(
        `Avatar with ID ${avatarId} not found`,
      );
    });

    it('should throw BadRequestException for invalid size', async () => {
      const avatarId = 'test-uuid';
      const dto: GetAvatarDto = { size: 10 }; // Invalid: > 9

      await expect(service.getAvatar(avatarId, dto)).rejects.toThrow(BadRequestException);
      await expect(service.getAvatar(avatarId, dto)).rejects.toThrow(
        'Size must be between 4 and 9',
      );
    });

    it('should apply filter when specified', async () => {
      const avatarId = 'test-uuid';
      const dto: GetAvatarDto = { filter: FilterType.GRAYSCALE };

      const mockAvatar = {
        id: avatarId,
        name: 'test-avatar',
        createdAt: new Date(),
        version: '0.0.1',
        filePath: '/path/to/avatar.png',
      };

      const mockAvatarObject = {
        meta_data_name: avatarId,
        image_6n: Buffer.from('image-data'),
      };

      const filteredImage = Buffer.from('filtered-image-data');

      mockAvatarRepository.findOne.mockResolvedValue(mockAvatar);
      mockStorageService.loadAvatar.mockResolvedValue(mockAvatarObject);
      mockGeneratorService.applyFilter.mockResolvedValue(filteredImage);

      const result = await service.getAvatar(avatarId, dto);

      expect(mockGeneratorService.applyFilter).toHaveBeenCalledWith(expect.any(Buffer), dto.filter);
      expect(result.image).toBe(filteredImage);
    });

    it('should use specified size', async () => {
      const avatarId = 'test-uuid';
      const dto: GetAvatarDto = { size: 7 };

      const mockAvatar = {
        id: avatarId,
        name: 'test-avatar',
        createdAt: new Date(),
        version: '0.0.1',
        filePath: '/path/to/avatar.png',
      };

      const mockAvatarObject = {
        meta_data_name: avatarId,
        image_7n: Buffer.from('large-image-data'),
      };

      mockAvatarRepository.findOne.mockResolvedValue(mockAvatar);
      mockStorageService.loadAvatar.mockResolvedValue(mockAvatarObject);

      await service.getAvatar(avatarId, dto);

      expect(mockStorageService.loadAvatar).toHaveBeenCalledWith(avatarId);
    });
  });

  describe('listAvatars', () => {
    it('should return paginated list of avatars', async () => {
      const dto: ListAvatarsDto = {
        pick: 10,
        offset: 0,
      };

      const mockAvatars = [
        { id: '1', name: 'avatar1', createdAt: new Date(), version: '0.0.1' },
        { id: '2', name: 'avatar2', createdAt: new Date(), version: '0.0.1' },
      ];

      mockAvatarRepository.findAndCount.mockResolvedValue([mockAvatars, 2]);

      const result = await service.listAvatars(dto);

      expect(result).toEqual({
        avatars: mockAvatars,
        pagination: {
          total: 2,
          offset: 0,
          pick: 10,
          hasMore: false,
        },
      });

      expect(mockAvatarRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        order: {
          createdAt: 'ASC',
        },
        select: [
          'id',
          'name',
          'createdAt',
          'version',
          'primaryColor',
          'foreignColor',
          'colorScheme',
          'seed',
        ],
      });
    });

    it('should use default pagination values', async () => {
      const dto: ListAvatarsDto = {};

      mockAvatarRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.listAvatars(dto);

      expect(mockAvatarRepository.findAndCount).toHaveBeenCalledWith({
        take: 10, // default pick
        skip: 0, // default offset
        order: {
          createdAt: 'ASC',
        },
        select: [
          'id',
          'name',
          'createdAt',
          'version',
          'primaryColor',
          'foreignColor',
          'colorScheme',
          'seed',
        ],
      });
    });

    it('should handle custom pagination values', async () => {
      const dto: ListAvatarsDto = {
        pick: 20,
        offset: 10,
      };

      mockAvatarRepository.findAndCount.mockResolvedValue([[], 30]);

      const result = await service.listAvatars(dto);

      expect(result.pagination).toEqual({
        total: 30,
        offset: 10,
        pick: 20,
        hasMore: false, // 10 + 20 = 30, equals total
      });

      expect(mockAvatarRepository.findAndCount).toHaveBeenCalledWith({
        take: 20,
        skip: 10,
        order: {
          createdAt: 'ASC',
        },
        select: [
          'id',
          'name',
          'createdAt',
          'version',
          'primaryColor',
          'foreignColor',
          'colorScheme',
          'seed',
        ],
      });
    });

    it('should indicate hasMore when there are more records', async () => {
      const dto: ListAvatarsDto = {
        pick: 10,
        offset: 0,
      };

      mockAvatarRepository.findAndCount.mockResolvedValue([[], 100]);

      const result = await service.listAvatars(dto);

      expect(result.pagination.hasMore).toBe(true); // 0 + 10 < 100
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar successfully', async () => {
      const avatarId = 'test-uuid';

      const mockAvatar = {
        id: avatarId,
        name: 'test-avatar',
        filePath: '/path/to/avatar.png',
      };

      mockAvatarRepository.findOne.mockResolvedValue(mockAvatar);
      mockStorageService.deleteAvatar.mockResolvedValue(undefined);
      mockAvatarRepository.remove.mockResolvedValue(mockAvatar);

      const result = await service.deleteAvatar(avatarId);

      expect(result).toEqual({
        message: 'Avatar deleted successfully',
      });

      expect(mockAvatarRepository.findOne).toHaveBeenCalledWith({
        where: { id: avatarId },
      });
      expect(mockStorageService.deleteAvatar).toHaveBeenCalledWith(avatarId);
      expect(mockAvatarRepository.remove).toHaveBeenCalledWith(mockAvatar);
    });

    it('should throw NotFoundException when avatar not found', async () => {
      const avatarId = 'non-existent-uuid';

      mockAvatarRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteAvatar(avatarId)).rejects.toThrow(NotFoundException);
      await expect(service.deleteAvatar(avatarId)).rejects.toThrow(
        `Avatar with ID ${avatarId} not found`,
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when database is connected', async () => {
      mockAvatarRepository.count.mockResolvedValue(5);

      const result = await service.healthCheck();

      expect(result).toEqual({
        database: 5,
        status: 'healthy',
      });
      expect(mockAvatarRepository.count).toHaveBeenCalled();
    });

    it('should return unhealthy status when database is not connected', async () => {
      mockAvatarRepository.count.mockResolvedValue(0);

      const result = await service.healthCheck();

      expect(result).toEqual({
        database: 0,
        status: 'unhealthy',
      });
    });
  });

  describe('getColorSchemes', () => {
    it('should return available color schemes', async () => {
      const mockSchemes = [
        { name: 'pastel', colors: ['#FFB3BA', '#FFDFBA'] },
        { name: 'vibrant', colors: ['#FF0000', '#00FF00'] },
      ];

      mockGeneratorService.getColorSchemes.mockReturnValue(mockSchemes);

      const result = await service.getColorSchemes();

      expect(result).toEqual(mockSchemes);
      expect(mockGeneratorService.getColorSchemes).toHaveBeenCalled();
    });
  });
});
