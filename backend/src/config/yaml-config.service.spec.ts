import { Test, TestingModule } from '@nestjs/testing';
import { YamlConfigService } from './yaml-config.service';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('YamlConfigService', () => {
  let service: YamlConfigService;

  const mockConfig = {
    app: {
      save_path: './storage/avatars',
      server: {
        host: 'localhost',
        port: 3000,
      },
      database: {
        driver: 'sqlite',
        connection: {
          maxRetries: 3,
          retryDelay: 2000,
        },
        sqlite_params: {
          url: 'file:./storage/database.sqlite',
        },
      },
    },
  };

  const validYamlConfig = `
app:
  save_path: "./storage/avatars"
  server:
    host: "localhost"
    port: 3000
  database:
    driver: "sqlite"
    connection:
      maxRetries: 3
      retryDelay: 2000
    sqlite_params:
      url: "file:./storage/database.sqlite"
`;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock fs methods before creating the module
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(validYamlConfig);

    const module: TestingModule = await Test.createTestingModule({
      providers: [YamlConfigService],
    }).compile();

    service = module.get<YamlConfigService>(YamlConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('loadConfig', () => {
    it('should load configuration successfully', () => {
      mockedFs.readFileSync.mockReturnValue(`
        app:
          save_path: "./storage/avatars"
          server:
            host: "localhost"
            port: 3000
          database:
            driver: "sqlite"
            connection:
              maxRetries: 3
              retryDelay: 2000
            sqlite_params:
              url: "file:./storage/database.sqlite"
      `);

      // Mock process.cwd to return a test directory
      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test');

      try {
        const newService = new YamlConfigService();
        const config = newService.getConfig();

        expect(config).toBeDefined();
        expect(config.app.save_path).toBe('./storage/avatars');
        expect(config.app.server.host).toBe('localhost');
        expect(config.app.server.port).toBe(3000);
      } finally {
        process.cwd = originalCwd;
      }
    });

    it('should throw error for invalid configuration', () => {
      mockedFs.readFileSync.mockReturnValue(`
        app:
          save_path: ""  # Invalid: empty string
          server:
            host: "localhost"
            port: 3000
          database:
            driver: "sqlite"
            connection:
              maxRetries: 3
              retryDelay: 2000
            sqlite_params:
              url: "file:./storage/database.sqlite"
      `);

      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test');

      try {
        expect(() => new YamlConfigService()).toThrow();
      } finally {
        process.cwd = originalCwd;
      }
    });

    it('should throw error when file does not exist', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test');

      try {
        expect(() => new YamlConfigService()).toThrow();
      } finally {
        process.cwd = originalCwd;
      }
    });
  });

  describe('getConfig', () => {
    it('should return configuration', () => {
      mockedFs.readFileSync.mockReturnValue(`
        app:
          save_path: "./storage/avatars"
          server:
            host: "localhost"
            port: 3000
          database:
            driver: "sqlite"
            connection:
              maxRetries: 3
              retryDelay: 2000
            sqlite_params:
              url: "file:./storage/database.sqlite"
      `);

      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test');

      try {
        const newService = new YamlConfigService();
        const config = newService.getConfig();

        expect(config).toBeDefined();
        expect(config.app).toBeDefined();
      } finally {
        process.cwd = originalCwd;
      }
    });
  });

  describe('getSavePath', () => {
    it('should return save path', () => {
      mockedFs.readFileSync.mockReturnValue(`
        app:
          save_path: "./storage/avatars"
          server:
            host: "localhost"
            port: 3000
          database:
            driver: "sqlite"
            connection:
              maxRetries: 3
              retryDelay: 2000
            sqlite_params:
              url: "file:./storage/database.sqlite"
      `);

      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test');

      try {
        const newService = new YamlConfigService();
        const savePath = newService.getSavePath();

        expect(savePath).toBe('./storage/avatars');
      } finally {
        process.cwd = originalCwd;
      }
    });
  });

  describe('getServerConfig', () => {
    it('should return server configuration', () => {
      mockedFs.readFileSync.mockReturnValue(`
        app:
          save_path: "./storage/avatars"
          server:
            host: "localhost"
            port: 3000
          database:
            driver: "sqlite"
            connection:
              maxRetries: 3
              retryDelay: 2000
            sqlite_params:
              url: "file:./storage/database.sqlite"
      `);

      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test');

      try {
        const newService = new YamlConfigService();
        const serverConfig = newService.getServerConfig();

        expect(serverConfig).toBeDefined();
        expect(serverConfig.host).toBe('localhost');
        expect(serverConfig.port).toBe(3000);
      } finally {
        process.cwd = originalCwd;
      }
    });
  });

  describe('getDatabaseConfig', () => {
    it('should return database configuration', () => {
      mockedFs.readFileSync.mockReturnValue(`
        app:
          save_path: "./storage/avatars"
          server:
            host: "localhost"
            port: 3000
          database:
            driver: "sqlite"
            connection:
              maxRetries: 3
              retryDelay: 2000
            sqlite_params:
              url: "file:./storage/database.sqlite"
      `);

      const originalCwd = process.cwd;
      process.cwd = jest.fn().mockReturnValue('/test');

      try {
        const newService = new YamlConfigService();
        const databaseConfig = newService.getDatabaseConfig();

        expect(databaseConfig).toBeDefined();
        expect(databaseConfig.driver).toBe('sqlite');
        expect(databaseConfig.sqlite_params.url).toBe('file:./storage/database.sqlite');
      } finally {
        process.cwd = originalCwd;
      }
    });
  });
});
