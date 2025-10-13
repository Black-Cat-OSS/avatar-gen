import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { AvatarController } from '../avatar.controller';
import { AvatarService } from '../avatar.service';
import {
  GenerateAvatarDto,
  GetAvatarDto,
  ListAvatarsDto,
} from '../../../common/dto/generate-avatar.dto';
import { FilterType } from '../../../common/enums/filter.enum';

describe('AvatarController', () => {
  let controller: AvatarController;
  let service: AvatarService;
  let mockAvatarService: any;

  beforeEach(async () => {
    // Create fresh mocks for each test
    mockAvatarService = {
      generateAvatar: vi.fn(),
      getAvatar: vi.fn(),
      listAvatars: vi.fn(),
      deleteAvatar: vi.fn(),
      healthCheck: vi.fn(),
      getColorSchemes: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarController],
      providers: [
        {
          provide: AvatarService,
          useValue: mockAvatarService,
        },
      ],
    }).compile();

    controller = module.get<AvatarController>(AvatarController);
    // Manually inject the mock service into the controller
    (controller as any).avatarService = mockAvatarService;
    service = mockAvatarService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('POST /api/generate', () => {
    it('should generate avatar successfully', async () => {
      const dto: GenerateAvatarDto = {
        primaryColor: '#FF0000',
        foreignColor: '#00FF00',
        seed: 'test-seed',
      };

      const mockResult = {
        id: 'test-uuid',
        createdAt: new Date(),
        version: '0.0.1',
      };

      mockAvatarService.generateAvatar.mockResolvedValue(mockResult);

      const result = await controller.generateAvatar(dto);

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Avatar generated successfully',
        data: mockResult,
      });
      expect(mockAvatarService.generateAvatar).toHaveBeenCalledWith(dto);
      expect(mockAvatarService.generateAvatar).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest on service error', async () => {
      const dto: GenerateAvatarDto = { seed: 'test' };
      const errorMessage = 'Invalid parameters';

      mockAvatarService.generateAvatar.mockRejectedValue(new Error(errorMessage));

      await expect(controller.generateAvatar(dto)).rejects.toThrow(HttpException);

      try {
        await controller.generateAvatar(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toMatchObject({
          statusCode: HttpStatus.BAD_REQUEST,
          message: errorMessage,
        });
      }
    });

    it('should accept optional color scheme', async () => {
      const dto: GenerateAvatarDto = {
        colorScheme: 'pastel',
      };

      const mockResult = {
        id: 'test-uuid',
        createdAt: new Date(),
        version: '0.0.1',
      };

      mockAvatarService.generateAvatar.mockResolvedValue(mockResult);

      await controller.generateAvatar(dto);

      expect(mockAvatarService.generateAvatar).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET /api/health', () => {
    it('should return health check status', async () => {
      const mockHealth = {
        database: 'connected',
        storage: 'available',
        uptime: 12345,
      };

      mockAvatarService.healthCheck.mockResolvedValue(mockHealth);

      const result = await controller.healthCheck();

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Health check completed',
        data: mockHealth,
      });
      expect(mockAvatarService.healthCheck).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerError on health check failure', async () => {
      mockAvatarService.healthCheck.mockRejectedValue(new Error('Database unavailable'));

      await expect(controller.healthCheck()).rejects.toThrow(HttpException);
    });
  });

  describe('GET /api/list', () => {
    it('should return paginated list of avatars', async () => {
      const dto: ListAvatarsDto = {
        pick: 10,
        offset: 0,
      };

      const mockResult = {
        avatars: [
          { id: '1', name: 'avatar1', createdAt: new Date() },
          { id: '2', name: 'avatar2', createdAt: new Date() },
        ],
        total: 2,
        pick: 10,
        offset: 0,
      };

      mockAvatarService.listAvatars.mockResolvedValue(mockResult);

      const result = await controller.listAvatars(dto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Avatar list retrieved successfully',
        data: mockResult,
      });
      expect(mockAvatarService.listAvatars).toHaveBeenCalledWith(dto);
    });

    it('should use default pagination values', async () => {
      const dto: ListAvatarsDto = {};
      const mockResult = {
        avatars: [],
        total: 0,
        pick: 10,
        offset: 0,
      };

      mockAvatarService.listAvatars.mockResolvedValue(mockResult);

      await controller.listAvatars(dto);

      expect(mockAvatarService.listAvatars).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequest on invalid parameters', async () => {
      const dto: ListAvatarsDto = { pick: 10 };

      mockAvatarService.listAvatars.mockRejectedValue(new Error('Invalid offset'));

      await expect(controller.listAvatars(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('GET /api/color-schemes', () => {
    it('should return available color schemes', async () => {
      const mockSchemes = [
        { name: 'pastel', colors: ['#FFB3BA', '#FFDFBA'] },
        { name: 'vibrant', colors: ['#FF0000', '#00FF00'] },
      ];

      mockAvatarService.getColorSchemes.mockResolvedValue(mockSchemes);

      const result = await controller.getColorSchemes();

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Color schemes retrieved successfully',
        data: mockSchemes,
      });
    });
  });

  describe('GET /api/:id', () => {
    it('should return avatar image', async () => {
      const mockResponse = {
        set: vi.fn(),
        send: vi.fn(),
      } as unknown as Response;

      const dto: GetAvatarDto = {};
      const avatarId = 'test-uuid';

      const mockResult = {
        id: avatarId,
        image: Buffer.from('fake-image-data'),
        contentType: 'image/png',
        createdAt: new Date(),
        version: '0.0.1',
      };

      mockAvatarService.getAvatar.mockResolvedValue(mockResult);

      await controller.getAvatar(avatarId, dto, mockResponse);

      expect(mockAvatarService.getAvatar).toHaveBeenCalledWith(avatarId, dto);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': mockResult.contentType,
        'Content-Length': mockResult.image.length.toString(),
        'X-Avatar-ID': mockResult.id,
        'X-Created-At': mockResult.createdAt.toISOString(),
        'X-Version': mockResult.version,
      });
      expect(mockResponse.send).toHaveBeenCalledWith(mockResult.image);
    });

    it('should apply filter when specified', async () => {
      const mockResponse = {
        set: vi.fn(),
        send: vi.fn(),
      } as unknown as Response;

      const dto: GetAvatarDto = { filter: FilterType.GRAYSCALE };
      const avatarId = 'test-uuid';

      const mockResult = {
        id: avatarId,
        image: Buffer.from('filtered-image-data'),
        contentType: 'image/png',
        createdAt: new Date(),
        version: '0.0.1',
      };

      mockAvatarService.getAvatar.mockResolvedValue(mockResult);

      await controller.getAvatar(avatarId, dto, mockResponse);

      expect(mockAvatarService.getAvatar).toHaveBeenCalledWith(avatarId, dto);
    });

    it('should apply size when specified', async () => {
      const mockResponse = {
        set: vi.fn(),
        send: vi.fn(),
      } as unknown as Response;

      const dto: GetAvatarDto = { size: 7 };
      const avatarId = 'test-uuid';

      const mockResult = {
        id: avatarId,
        image: Buffer.from('sized-image-data'),
        contentType: 'image/png',
        createdAt: new Date(),
        version: '0.0.1',
      };

      mockAvatarService.getAvatar.mockResolvedValue(mockResult);

      await controller.getAvatar(avatarId, dto, mockResponse);

      expect(mockAvatarService.getAvatar).toHaveBeenCalledWith(avatarId, dto);
    });

    it('should throw HttpException when avatar not found', async () => {
      const mockResponse = {
        set: vi.fn(),
        send: vi.fn(),
      } as unknown as Response;

      const dto: GetAvatarDto = {};
      const avatarId = 'non-existent-uuid';

      const notFoundError = new Error('Avatar not found');
      (notFoundError as any).status = HttpStatus.NOT_FOUND;

      mockAvatarService.getAvatar.mockRejectedValue(notFoundError);

      await expect(controller.getAvatar(avatarId, dto, mockResponse)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('DELETE /api/:id', () => {
    it('should delete avatar successfully', async () => {
      const avatarId = 'test-uuid';
      const mockResult = {
        message: 'Avatar deleted successfully',
      };

      mockAvatarService.deleteAvatar.mockResolvedValue(mockResult);

      const result = await controller.deleteAvatar(avatarId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: mockResult.message,
      });
      expect(mockAvatarService.deleteAvatar).toHaveBeenCalledWith(avatarId);
    });

    it('should throw HttpException when avatar not found for deletion', async () => {
      const avatarId = 'non-existent-uuid';
      const notFoundError = new Error('Avatar not found');
      (notFoundError as any).status = HttpStatus.NOT_FOUND;

      mockAvatarService.deleteAvatar.mockRejectedValue(notFoundError);

      await expect(controller.deleteAvatar(avatarId)).rejects.toThrow(HttpException);
    });

    it('should handle internal server errors during deletion', async () => {
      const avatarId = 'test-uuid';
      mockAvatarService.deleteAvatar.mockRejectedValue(new Error('Database error'));

      await expect(controller.deleteAvatar(avatarId)).rejects.toThrow(HttpException);
    });
  });
});
