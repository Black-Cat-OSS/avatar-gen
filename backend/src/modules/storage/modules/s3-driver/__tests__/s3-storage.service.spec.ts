import { Test, TestingModule } from '@nestjs/testing';
import { S3StorageService } from '../s3-storage.service';
import { S3Service } from '../../../../s3';
import { NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';

describe('S3StorageService', () => {
  let service: S3StorageService;
  let s3Service: any;

  const mockAvatarObject = {
    meta_data_name: 'test-avatar',
    meta_data_created_at: new Date('2025-01-01'),
    image_4n: Buffer.from([1, 2, 3, 4]),
    image_5n: Buffer.from([5, 6, 7, 8]),
    image_6n: Buffer.from([9, 10, 11, 12]),
    image_7n: Buffer.from([13, 14, 15, 16]),
    image_8n: Buffer.from([17, 18, 19, 20]),
    image_9n: Buffer.from([21, 22, 23, 24]),
  };

  beforeEach(async () => {
    // Reset mocks first
    vi.clearAllMocks();

    const mockS3ServiceProvider = {
      uploadObject: vi.fn(),
      getObject: vi.fn(),
      deleteObject: vi.fn(),
      objectExists: vi.fn(),
    };

    // Create service directly with mocked dependencies
    service = new S3StorageService(mockS3ServiceProvider as any);
    s3Service = mockS3ServiceProvider;
    
    // Ensure s3Service is properly injected
    expect(s3Service).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveAvatar', () => {
    it('should save avatar to S3 successfully', async () => {
      const expectedUrl = 'https://s3.example.com/test-bucket/avatars/test-avatar.obj';
      s3Service.uploadObject.mockResolvedValue(expectedUrl);

      const result = await service.saveAvatar(mockAvatarObject);

      expect(result).toBe(expectedUrl);
      expect(s3Service.uploadObject).toHaveBeenCalledWith(
        'avatars/test-avatar.obj',
        expect.any(Buffer),
        'application/json',
      );
    });

    it('should throw error when save fails', async () => {
      s3Service.uploadObject.mockRejectedValue(new Error('Upload failed'));

      await expect(service.saveAvatar(mockAvatarObject)).rejects.toThrow(
        'Failed to save avatar to S3',
      );
    });
  });

  describe('loadAvatar', () => {
    it('should load avatar from S3 successfully', async () => {
      const serializedData = JSON.stringify({
        ...mockAvatarObject,
        meta_data_created_at: mockAvatarObject.meta_data_created_at.toISOString(),
        image_4n: Array.from(mockAvatarObject.image_4n),
        image_5n: Array.from(mockAvatarObject.image_5n),
        image_6n: Array.from(mockAvatarObject.image_6n),
        image_7n: Array.from(mockAvatarObject.image_7n),
        image_8n: Array.from(mockAvatarObject.image_8n),
        image_9n: Array.from(mockAvatarObject.image_9n),
      });

      s3Service.objectExists.mockResolvedValue(true);
      s3Service.getObject.mockResolvedValue(Buffer.from(serializedData));

      const result = await service.loadAvatar('test-avatar');

      expect(result.meta_data_name).toBe('test-avatar');
      expect(result.image_4n).toBeInstanceOf(Buffer);
      expect(s3Service.objectExists).toHaveBeenCalledWith('avatars/test-avatar.obj');
      expect(s3Service.getObject).toHaveBeenCalledWith('avatars/test-avatar.obj');
    });

    it('should throw NotFoundException when avatar does not exist', async () => {
      s3Service.objectExists.mockResolvedValue(false);

      await expect(service.loadAvatar('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.loadAvatar('non-existent')).rejects.toThrow(
        'Avatar with ID non-existent not found',
      );
    });

    it('should throw error when load fails', async () => {
      s3Service.objectExists.mockResolvedValue(true);
      s3Service.getObject.mockRejectedValue(new Error('S3 error'));

      await expect(service.loadAvatar('test-avatar')).rejects.toThrow(
        'Failed to load avatar from S3',
      );
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar from S3 successfully', async () => {
      s3Service.objectExists.mockResolvedValue(true);
      s3Service.deleteObject.mockResolvedValue(undefined);

      await service.deleteAvatar('test-avatar');

      expect(s3Service.objectExists).toHaveBeenCalledWith('avatars/test-avatar.obj');
      expect(s3Service.deleteObject).toHaveBeenCalledWith('avatars/test-avatar.obj');
    });

    it('should throw NotFoundException when avatar does not exist', async () => {
      s3Service.objectExists.mockResolvedValue(false);

      await expect(service.deleteAvatar('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw error when delete fails', async () => {
      s3Service.objectExists.mockResolvedValue(true);
      s3Service.deleteObject.mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteAvatar('test-avatar')).rejects.toThrow(
        'Failed to delete avatar from S3',
      );
    });
  });

  describe('exists', () => {
    it('should return true when avatar exists', async () => {
      s3Service.objectExists.mockResolvedValue(true);

      const result = await service.exists('test-avatar');

      expect(result).toBe(true);
      expect(s3Service.objectExists).toHaveBeenCalledWith('avatars/test-avatar.obj');
    });

    it('should return false when avatar does not exist', async () => {
      s3Service.objectExists.mockResolvedValue(false);

      const result = await service.exists('test-avatar');

      expect(result).toBe(false);
    });

    it('should return false when check fails', async () => {
      s3Service.objectExists.mockRejectedValue(new Error('Check failed'));

      const result = await service.exists('test-avatar');

      expect(result).toBe(false);
    });
  });
});
