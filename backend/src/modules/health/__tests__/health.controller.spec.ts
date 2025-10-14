import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(typeof result.uptime).toBe('number');
    });

    it('should return valid timestamp', () => {
      const result = controller.getHealth();
      const timestamp = new Date(result.timestamp);

      expect(timestamp instanceof Date).toBe(true);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should return positive uptime', () => {
      const result = controller.getHealth();

      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health status', () => {
      const result = controller.getDetailedHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('version');
    });

    it('should return memory usage', () => {
      const result = controller.getDetailedHealth();

      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('heapTotal');
      expect(result.memory).toHaveProperty('heapUsed');
      expect(result.memory).toHaveProperty('external');
      expect(typeof result.memory.rss).toBe('number');
      expect(typeof result.memory.heapTotal).toBe('number');
      expect(typeof result.memory.heapUsed).toBe('number');
    });

    it('should return node version', () => {
      const result = controller.getDetailedHealth();

      expect(typeof result.version).toBe('string');
      expect(result.version).toMatch(/^v\d+\.\d+\.\d+/);
    });
  });
});
