import { Test, TestingModule } from '@nestjs/testing';
import { AvatarGeneratorService } from './avatar-generator.service';
import { FilterType } from '../../common/enums/filter.enum';

describe('AvatarGeneratorService', () => {
  let service: AvatarGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvatarGeneratorService],
    }).compile();

    service = module.get<AvatarGeneratorService>(AvatarGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAvatar', () => {
    it('should generate avatar with default colors', async () => {
      const result = await service.generateAvatar();
      
      expect(result).toBeDefined();
      expect(result.meta_data_name).toBeDefined();
      expect(result.meta_data_created_at).toBeInstanceOf(Date);
      expect(result.image_4n).toBeInstanceOf(Buffer);
      expect(result.image_5n).toBeInstanceOf(Buffer);
      expect(result.image_6n).toBeInstanceOf(Buffer);
      expect(result.image_7n).toBeInstanceOf(Buffer);
      expect(result.image_8n).toBeInstanceOf(Buffer);
      expect(result.image_9n).toBeInstanceOf(Buffer);
    });

    it('should generate avatar with custom colors', async () => {
      const result = await service.generateAvatar('red', 'pink');
      
      expect(result).toBeDefined();
      expect(result.meta_data_name).toBeDefined();
    });

    it('should generate avatar with color scheme', async () => {
      const result = await service.generateAvatar(undefined, undefined, 'green');
      
      expect(result).toBeDefined();
      expect(result.meta_data_name).toBeDefined();
    });

    it('should generate avatar with seed', async () => {
      const result = await service.generateAvatar(undefined, undefined, undefined, 'test-seed');
      
      expect(result).toBeDefined();
      expect(result.meta_data_name).toBeDefined();
    });
  });

  describe('applyFilter', () => {
    let testImage: Buffer;

    beforeEach(() => {
      // Create a simple test image buffer
      testImage = Buffer.alloc(100);
    });

    it('should apply grayscale filter', async () => {
      const result = await service.applyFilter(testImage, FilterType.GRAYSCALE);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should apply sepia filter', async () => {
      const result = await service.applyFilter(testImage, FilterType.SEPIA);
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should apply negative filter', async () => {
      const result = await service.applyFilter(testImage, FilterType.NEGATIVE);
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('getColorSchemes', () => {
    it('should return color schemes', () => {
      const schemes = service.getColorSchemes();
      
      expect(Array.isArray(schemes)).toBe(true);
      expect(schemes.length).toBeGreaterThan(0);
      expect(schemes[0]).toHaveProperty('name');
      expect(schemes[0]).toHaveProperty('primaryColor');
      expect(schemes[0]).toHaveProperty('foreignColor');
    });
  });
});

