import { describe, it, expect, beforeEach, vi } from 'vitest';
import { YamlFileStrategy } from '../yaml-file.strategy';
import { YamlSettingsFinder } from 'find-settings.lib/yaml';

vi.mock('find-settings.lib/yaml');

describe('YamlFileStrategy', () => {
  let strategy: YamlFileStrategy;

  beforeEach(() => {
    strategy = new YamlFileStrategy();
    vi.clearAllMocks();
  });

  describe('getName', () => {
    it('should return strategy name', () => {
      expect(strategy.getName()).toBe('YamlFileStrategy');
    });
  });

  describe('createBuildPlan', () => {
    it('should create plan with all files when NODE_ENV is set', () => {
      // Мокируем YamlSettingsFinder.find() чтобы вернуть все файлы
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue([
          'settings.yaml',
          'settings.local.yaml',
          'settings.development.yaml',
          'settings.development.local.yaml',
        ]),
      }) as any);

      const plan = strategy.createBuildPlan('/config', 'development');

      expect(plan.baseDir).toBe('/config');
      expect(plan.nodeEnv).toBe('development');
      expect(plan.filesToLoad).toHaveLength(4);

      expect(plan.filesToLoad[0]).toEqual({
        fileName: 'settings.yaml',
        required: true,
      });

      expect(plan.filesToLoad[1]).toEqual({
        fileName: 'settings.local.yaml',
        required: false,
      });

      expect(plan.filesToLoad[2]).toEqual({
        fileName: 'settings.development.yaml',
        required: false,
      });

      expect(plan.filesToLoad[3]).toEqual({
        fileName: 'settings.development.local.yaml',
        required: false,
      });
    });

    it('should skip env-specific files if NODE_ENV not set', () => {
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml', 'settings.local.yaml']),
      }) as any);

      const plan = strategy.createBuildPlan('/config');

      expect(plan.filesToLoad).toHaveLength(2);
      expect(plan.filesToLoad.map((f) => f.fileName)).toEqual([
        'settings.yaml',
        'settings.local.yaml',
      ]);
    });

    it('should create plan for production environment', () => {
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue([
          'settings.yaml',
          'settings.local.yaml',
          'settings.production.yaml',
          'settings.production.local.yaml',
        ]),
      }) as any);

      const plan = strategy.createBuildPlan('/app/config', 'production');

      expect(plan.nodeEnv).toBe('production');
      expect(plan.filesToLoad[2].fileName).toBe('settings.production.yaml');
      expect(plan.filesToLoad[3].fileName).toBe('settings.production.local.yaml');
    });

    it('should create plan for test environment', () => {
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue([
          'settings.yaml',
          'settings.local.yaml',
          'settings.test.yaml',
          'settings.test.local.yaml',
        ]),
      }) as any);

      const plan = strategy.createBuildPlan('/test', 'test');

      expect(plan.nodeEnv).toBe('test');
      expect(plan.filesToLoad[2].fileName).toBe('settings.test.yaml');
      expect(plan.filesToLoad[3].fileName).toBe('settings.test.local.yaml');
    });

    it('should mark only base settings as required', () => {
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue([
          'settings.yaml',
          'settings.local.yaml',
          'settings.development.yaml',
          'settings.development.local.yaml',
        ]),
      }) as any);

      const plan = strategy.createBuildPlan('/config', 'development');

      const requiredFiles = plan.filesToLoad.filter((f) => f.required);

      expect(requiredFiles).toHaveLength(1);
      expect(requiredFiles[0].fileName).toBe('settings.yaml');
    });

    it('should include only existing files in plan', () => {
      // Только settings.yaml и settings.local.yaml найдены
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue(['settings.yaml', 'settings.local.yaml']),
      }) as any);

      const plan = strategy.createBuildPlan('/config', 'development');

      expect(plan.filesToLoad).toHaveLength(2);
      expect(plan.filesToLoad.map((f) => f.fileName)).toEqual([
        'settings.yaml',
        'settings.local.yaml',
      ]);
    });

    it('should throw error if required file (settings.yaml) not found', () => {
      // YamlSettingsFinder не нашел ни одного файла
      vi.mocked(YamlSettingsFinder).mockImplementation(() => ({
        find: vi.fn().mockReturnValue([]),
      }) as any);

      expect(() => {
        strategy.createBuildPlan('/config', 'development');
      }).toThrow('Required configuration file not found: settings.yaml');
    });
  });
});
