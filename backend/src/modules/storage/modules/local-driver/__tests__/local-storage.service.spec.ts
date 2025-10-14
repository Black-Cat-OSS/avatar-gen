import { Test, TestingModule } from '@nestjs/testing';
import { LocalStorageService } from '../local-storage.service';
import { YamlConfigService } from '../../../../../config/modules/yaml-driver/yaml-config.service';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { vi } from 'vitest';

vi.mock('fs');
const mockedFs = fs as any;

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let configService: any;

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
    vi.clearAllMocks();

    const mockConfigService = {
      getStorageConfig: vi.fn().mockReturnValue({
        type: 'local',
        local: {
          save_path: './storage/test-avatars',
        },
      }),
    };

    // Create service directly with mocked dependencies
    service = new LocalStorageService(mockConfigService as any);
    configService = mockConfigService;
    
    // Ensure configService is properly injected
    expect(configService).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveAvatar', () => {
    it('should save avatar to local storage successfully', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.writeFileSync.mockImplementation(() => {});

      const result = await service.saveAvatar(mockAvatarObject);

      expect(result).toContain('test-avatar.obj');
      expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });

    it('should create directory if it does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.mkdirSync.mockImplementation(() => {});
      mockedFs.writeFileSync.mockImplementation(() => {});

      await service.saveAvatar(mockAvatarObject);

      expect(mockedFs.mkdirSync).toHaveBeenCalled();
      expect(mockedFs.writeFileSync).toHaveBeenCalled();
    });

    it('should throw error when save fails', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(service.saveAvatar(mockAvatarObject)).rejects.toThrow(
        'Failed to save avatar to local storage',
      );
    });
  });

  describe('loadAvatar', () => {
    it('should load avatar from local storage successfully', async () => {
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

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(serializedData);

      const result = await service.loadAvatar('test-avatar');

      expect(result.meta_data_name).toBe('test-avatar');
      expect(result.image_4n).toBeInstanceOf(Buffer);
    });

    it('should throw NotFoundException when avatar does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      await expect(service.loadAvatar('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw error when load fails', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('Read failed');
      });

      await expect(service.loadAvatar('test-avatar')).rejects.toThrow(
        'Failed to load avatar from local storage',
      );
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar from local storage successfully', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.unlinkSync.mockImplementation(() => {});

      await service.deleteAvatar('test-avatar');

      expect(mockedFs.unlinkSync).toHaveBeenCalled();
    });

    it('should throw NotFoundException when avatar does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      await expect(service.deleteAvatar('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw error when delete fails', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.unlinkSync.mockImplementation(() => {
        throw new Error('Delete failed');
      });

      await expect(service.deleteAvatar('test-avatar')).rejects.toThrow(
        'Failed to delete avatar from local storage',
      );
    });
  });

  describe('exists', () => {
    it('should return true when avatar exists', async () => {
      mockedFs.existsSync.mockReturnValue(true);

      const result = await service.exists('test-avatar');

      expect(result).toBe(true);
    });

    it('should return false when avatar does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = await service.exists('test-avatar');

      expect(result).toBe(false);
    });
  });
});
