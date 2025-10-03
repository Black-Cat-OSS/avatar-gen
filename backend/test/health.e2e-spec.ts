import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HealthModule } from '../src/modules/health/health.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(typeof res.body.uptime).toBe('number');
          expect(res.body.uptime).toBeGreaterThanOrEqual(0);
        });
    });

    it('should return timestamp in ISO format', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          const timestamp = new Date(res.body.timestamp);
          expect(timestamp.toISOString()).toBe(res.body.timestamp);
        });
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health status', () => {
      return request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('memory');
          expect(res.body).toHaveProperty('version');
        });
    });

    it('should return memory usage details', () => {
      return request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200)
        .expect((res) => {
          expect(res.body.memory).toHaveProperty('rss');
          expect(res.body.memory).toHaveProperty('heapTotal');
          expect(res.body.memory).toHaveProperty('heapUsed');
          expect(res.body.memory).toHaveProperty('external');
        });
    });

    it('should return node version', () => {
      return request(app.getHttpServer())
        .get('/health/detailed')
        .expect(200)
        .expect((res) => {
          expect(res.body.version).toMatch(/^v\d+\.\d+\.\d+$/);
        });
    });
  });
});

