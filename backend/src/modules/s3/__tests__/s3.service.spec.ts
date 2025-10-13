import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from '../s3.service';
import { Logger } from '@nestjs/common';
import { vi } from 'vitest';

// Mock AWS SDK
vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(),
  HeadBucketCommand: vi.fn(),
  PutObjectCommand: vi.fn(),
  GetObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
  HeadObjectCommand: vi.fn(),
}));

describe('S3Service', () => {
  let service: S3Service;
  let mockS3Client: any;

  const mockConfig = {
    app: {
      storage: {
        type: 's3',
        s3: {
          endpoint: 'https://s3.example.com',
          bucket: 'test-bucket',
          access_key: 'test-access-key',
          secret_key: 'test-secret-key',
          region: 'us-east-1',
          force_path_style: true,
          connection: {
            maxRetries: 3,
            retryDelay: 1000,
          },
        },
      },
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockS3Client = {
      send: vi.fn(),
      destroy: vi.fn(),
    };

    const { S3Client } = await import('@aws-sdk/client-s3');
    vi.mocked(S3Client).mockImplementation(() => mockS3Client);

    service = new S3Service(mockConfig);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return true when bucket is accessible', async () => {
      mockS3Client.send.mockResolvedValue({});

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should return false when bucket is not accessible', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Bucket not found'));
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('uploadObject', () => {
    it('should upload object successfully', async () => {
      mockS3Client.send.mockResolvedValue({});
      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      const buffer = Buffer.from('test data');
      const result = await service.uploadObject('test-key', buffer, 'application/json');

      expect(result).toContain('test-bucket/test-key');
      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should throw error when upload fails', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Upload failed'));
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      const buffer = Buffer.from('test data');

      await expect(service.uploadObject('test-key', buffer, 'application/json')).rejects.toThrow(
        'Failed to upload object to S3',
      );
    });
  });

  describe('getObject', () => {
    it('should retrieve object successfully', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield Buffer.from('test');
          yield Buffer.from(' data');
        },
      };

      mockS3Client.send.mockResolvedValue({ Body: mockStream });
      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      const result = await service.getObject('test-key');

      expect(result.toString()).toBe('test data');
      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should throw error when object not found', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Object not found'));
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.getObject('test-key')).rejects.toThrow('Failed to get object from S3');
    });

    it('should throw error when response body is empty', async () => {
      mockS3Client.send.mockResolvedValue({ Body: null });
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.getObject('test-key')).rejects.toThrow('Empty response body');
    });
  });

  describe('deleteObject', () => {
    it('should delete object successfully', async () => {
      mockS3Client.send.mockResolvedValue({});
      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      await service.deleteObject('test-key');

      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should throw error when delete fails', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Delete failed'));
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.deleteObject('test-key')).rejects.toThrow(
        'Failed to delete object from S3',
      );
    });
  });

  describe('objectExists', () => {
    it('should return true when object exists', async () => {
      mockS3Client.send.mockResolvedValue({});

      const result = await service.objectExists('test-key');

      expect(result).toBe(true);
    });

    it('should return false when object does not exist (NotFound)', async () => {
      const error = new Error('Not Found');
      (error as any).name = 'NotFound';
      mockS3Client.send.mockRejectedValue(error);

      const result = await service.objectExists('test-key');

      expect(result).toBe(false);
    });

    it('should return false when object does not exist (404)', async () => {
      const error = new Error('Not Found');
      (error as any).$metadata = { httpStatusCode: 404 };
      mockS3Client.send.mockRejectedValue(error);

      const result = await service.objectExists('test-key');

      expect(result).toBe(false);
    });

    it('should throw error for other errors', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Server error'));
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

      await expect(service.objectExists('test-key')).rejects.toThrow(
        'Failed to check object existence in S3',
      );
    });
  });

  describe('getS3Info', () => {
    it('should return S3 info', () => {
      const info = service.getS3Info();

      expect(info).toEqual({
        endpoint: 'https://s3.example.com',
        bucket: 'test-bucket',
        region: 'us-east-1',
        isConnected: false,
        forcePathStyle: true,
      });
    });
  });

  describe('onModuleInit', () => {
    it('should initialize successfully', async () => {
      mockS3Client.send.mockResolvedValue({});
      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      await service.onModuleInit();

      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should retry on failure', async () => {
      mockS3Client.send
        .mockRejectedValueOnce(new Error('Failed'))
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({});

      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
      vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      await service.onModuleInit();

      expect(mockS3Client.send).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      mockS3Client.send.mockRejectedValue(new Error('Failed'));
      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
      vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
      vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

      await expect(service.onModuleInit()).rejects.toThrow('S3 connection failed after');
    });
  });

  describe('onModuleDestroy', () => {
    it('should destroy S3 client', async () => {
      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      await service.onModuleDestroy();

      expect(mockS3Client.destroy).toHaveBeenCalled();
    });
  });

  describe('reconnect', () => {
    it('should reconnect successfully', async () => {
      mockS3Client.send.mockResolvedValue({});
      vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

      await service.reconnect();

      expect(mockS3Client.send).toHaveBeenCalled();
    });
  });
});
