import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileReaderService } from '../file-reader.service';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { YamlDotEnv } from 'yaml-dotenv';

vi.mock('fs');
vi.mock('yaml-dotenv');

describe('FileReaderService', () => {
  let service: FileReaderService;

  beforeEach(() => {
    service = new FileReaderService();
    vi.clearAllMocks();
  });

  describe('readYamlFile', () => {
    it('should read YAML and substitute env variables', () => {
      const yamlContent = 'port: ${PORT:-3000}';
      const processed = 'port: 3000';

      vi.mocked(fs.readFileSync).mockReturnValue(yamlContent);
      vi.mocked(YamlDotEnv.convertTo).mockReturnValue(processed);

      const result = service.readYamlFile('/test.yaml');

      expect(fs.readFileSync).toHaveBeenCalledWith('/test.yaml', 'utf8');
      expect(YamlDotEnv.convertTo).toHaveBeenCalledWith(yamlContent);
      expect(result).toEqual({ port: 3000 });
    });

    it('should throw error for invalid YAML', () => {
      vi.mocked(fs.readFileSync).mockReturnValue('invalid: yaml: :');
      vi.mocked(YamlDotEnv.convertTo).mockReturnValue('invalid: yaml: :');

      expect(() => service.readYamlFile('/test.yaml')).toThrow();
    });

    it('should handle file read errors', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File read error');
      });

      expect(() => service.readYamlFile('/test.yaml')).toThrow('File read error');
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      expect(service.fileExists('/test.yaml')).toBe(true);
    });

    it('should return false if file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      expect(service.fileExists('/test.yaml')).toBe(false);
    });
  });
});
