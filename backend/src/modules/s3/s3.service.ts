import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { IS3Connection, S3Info } from './interfaces/s3-connection.interface';

/**
 * Сервис для работы с S3-совместимым хранилищем
 *
 * Реализует интерфейс IS3Connection для взаимодействия с S3.
 * Поддерживает повторные попытки подключения и обработку ошибок.
 *
 * @class S3Service
 * @implements {IS3Connection}
 */
@Injectable()
export class S3Service implements IS3Connection {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private isConnected = false;
  private readonly config: Record<string, unknown>;

  constructor(config: Record<string, unknown>) {
    this.config = config;

    const s3Config = (
      this.config as {
        app: {
          storage: {
            s3: {
              endpoint: string;
              access_key: string;
              secret_key: string;
              region: string;
              force_path_style: boolean;
            };
          };
        };
      }
    ).app.storage.s3;

    this.client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.access_key,
        secretAccessKey: s3Config.secret_key,
      },
      forcePathStyle: s3Config.force_path_style,
    });

    this.logger.log('S3 client created');
  }

  /**
   * Инициализация модуля и подключение к S3 с повторными попытками
   *
   * @returns {Promise<void>}
   * @throws {Error} Если подключение не удалось установить после всех попыток
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing S3 connection...');
    await this.connectWithRetry();
  }

  /**
   * Отключение от S3 при уничтожении модуля
   *
   * @returns {Promise<void>}
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Destroying S3 connection...');
    this.client.destroy();
    this.isConnected = false;
    this.logger.log('S3 connection destroyed');
  }

  /**
   * Проверка доступности S3 хранилища
   *
   * @returns {Promise<boolean>} true если S3 доступен и бакет существует
   */
  async healthCheck(): Promise<boolean> {
    try {
      const bucket = this.getBucketName();
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
      return true;
    } catch (error) {
      this.logger.error(`S3 health check failed: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Загрузка объекта в S3
   *
   * @param {string} key - Ключ объекта в S3
   * @param {Buffer} data - Данные для загрузки
   * @param {string} contentType - MIME тип содержимого
   * @returns {Promise<string>} URL загруженного объекта
   * @throws {Error} Если загрузка не удалась
   */
  async uploadObject(key: string, data: Buffer, contentType: string): Promise<string> {
    try {
      const bucket = this.getBucketName();
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      });

      await this.client.send(command);
      this.logger.log(`Object uploaded to S3: ${key}`);

      return `${this.getS3Info().endpoint}/${bucket}/${key}`;
    } catch (error) {
      this.logger.error(`Failed to upload object to S3: ${error.message}`, error);
      throw new Error(`Failed to upload object to S3: ${error.message}`);
    }
  }

  /**
   * Получение объекта из S3
   *
   * @param {string} key - Ключ объекта в S3
   * @returns {Promise<Buffer>} Данные объекта
   * @throws {Error} Если объект не найден или загрузка не удалась
   */
  async getObject(key: string): Promise<Buffer> {
    try {
      const bucket = this.getBucketName();
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      const stream = response.Body;

      if (!stream) {
        throw new Error('Empty response body');
      }

      const chunks: Buffer[] = [];
      for await (const chunk of stream as AsyncIterable<Buffer>) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      this.logger.log(`Object retrieved from S3: ${key}`);
      return buffer;
    } catch (error) {
      this.logger.error(`Failed to get object from S3: ${error.message}`, error);
      throw new Error(`Failed to get object from S3: ${error.message}`);
    }
  }

  /**
   * Удаление объекта из S3
   *
   * @param {string} key - Ключ объекта в S3
   * @returns {Promise<void>}
   * @throws {Error} Если удаление не удалось
   */
  async deleteObject(key: string): Promise<void> {
    try {
      const bucket = this.getBucketName();
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);
      this.logger.log(`Object deleted from S3: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete object from S3: ${error.message}`, error);
      throw new Error(`Failed to delete object from S3: ${error.message}`);
    }
  }

  /**
   * Проверка существования объекта в S3
   *
   * @param {string} key - Ключ объекта в S3
   * @returns {Promise<boolean>} true если объект существует
   */
  async objectExists(key: string): Promise<boolean> {
    try {
      const bucket = this.getBucketName();
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      this.logger.error(`Failed to check object existence in S3: ${error.message}`, error);
      throw new Error(`Failed to check object existence in S3: ${error.message}`);
    }
  }

  /**
   * Получение информации о подключении к S3
   *
   * @returns {S3Info} Объект с информацией о конфигурации S3
   */
  getS3Info(): S3Info {
    const s3Config = (
      this.config as {
        app: {
          storage: {
            s3: {
              endpoint: string;
              bucket: string;
              region: string;
              force_path_style: boolean;
            };
          };
        };
      }
    ).app.storage.s3;

    return {
      endpoint: s3Config.endpoint,
      bucket: s3Config.bucket,
      region: s3Config.region,
      isConnected: this.isConnected,
      forcePathStyle: s3Config.force_path_style,
    };
  }

  /**
   * Принудительное переподключение к S3
   *
   * @returns {Promise<void>}
   * @throws {Error} Если переподключение не удалось после всех попыток
   */
  async reconnect(): Promise<void> {
    this.logger.log('Reconnecting to S3...');
    this.isConnected = false;
    await this.connectWithRetry();
  }

  /**
   * Подключение к S3 с повторными попытками
   *
   * @param {number} retryCount - текущий номер попытки
   * @returns {Promise<void>}
   * @throws {Error} Если все попытки подключения исчерпаны
   */
  private async connectWithRetry(retryCount = 1): Promise<void> {
    const { maxRetries, retryDelay } = (
      this.config as {
        app: { storage: { s3: { connection: { maxRetries: number; retryDelay: number } } } };
      }
    ).app.storage.s3.connection;

    try {
      const isAvailable = await this.healthCheck();
      if (!isAvailable) {
        throw new Error('S3 bucket is not accessible');
      }

      this.isConnected = true;
      this.logger.log(`S3 connected successfully on attempt ${retryCount}`);
    } catch (error) {
      this.logger.error(`S3 connection attempt ${retryCount} failed`, error);

      if (retryCount < maxRetries) {
        this.logger.warn(
          `Retrying S3 connection in ${retryDelay}ms... (${retryCount}/${maxRetries})`,
        );
        await this.delay(retryDelay);
        return this.connectWithRetry(retryCount + 1);
      }

      this.logger.error(`S3 connection failed after ${maxRetries} attempts`);
      throw new Error(
        `S3 connection failed after ${maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Задержка выполнения
   *
   * @param {number} ms - количество миллисекунд
   * @returns {Promise<void>}
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Получение имени бакета из конфигурации
   *
   * @private
   * @returns {string} Имя бакета
   */
  private getBucketName(): string {
    return (
      this.config as {
        app: { storage: { s3: { bucket: string } } };
      }
    ).app.storage.s3.bucket;
  }
}
