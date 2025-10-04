/**
 * Интерфейс для взаимодействия с S3-совместимым хранилищем
 *
 * Определяет контракт для реализации подключения к S3-совместимым хранилищам.
 * Соблюдается принцип подстановки Лисков (LSP) - все реализации должны быть взаимозаменяемы.
 *
 * @interface IS3Connection
 */
export interface IS3Connection {
  /**
   * Инициализация модуля и подключение к S3
   *
   * @returns {Promise<void>}
   * @throws {Error} Если подключение не удалось установить после всех попыток
   */
  onModuleInit(): Promise<void>;

  /**
   * Отключение от S3 при уничтожении модуля
   *
   * @returns {Promise<void>}
   */
  onModuleDestroy(): Promise<void>;

  /**
   * Проверка доступности S3 хранилища
   *
   * Выполняет проверку доступности бакета.
   * Используется для health check endpoints и инициализации.
   *
   * @returns {Promise<boolean>} true если S3 доступен и бакет существует, false в противном случае
   */
  healthCheck(): Promise<boolean>;

  /**
   * Загрузка объекта в S3
   *
   * @param {string} key - Ключ объекта в S3
   * @param {Buffer} data - Данные для загрузки
   * @param {string} contentType - MIME тип содержимого
   * @returns {Promise<string>} URL загруженного объекта
   * @throws {Error} Если загрузка не удалась
   */
  uploadObject(key: string, data: Buffer, contentType: string): Promise<string>;

  /**
   * Получение объекта из S3
   *
   * @param {string} key - Ключ объекта в S3
   * @returns {Promise<Buffer>} Данные объекта
   * @throws {Error} Если объект не найден или загрузка не удалась
   */
  getObject(key: string): Promise<Buffer>;

  /**
   * Удаление объекта из S3
   *
   * @param {string} key - Ключ объекта в S3
   * @returns {Promise<void>}
   * @throws {Error} Если удаление не удалось
   */
  deleteObject(key: string): Promise<void>;

  /**
   * Проверка существования объекта в S3
   *
   * @param {string} key - Ключ объекта в S3
   * @returns {Promise<boolean>} true если объект существует, false в противном случае
   */
  objectExists(key: string): Promise<boolean>;

  /**
   * Получение информации о подключении к S3
   *
   * @returns {S3Info} Объект с информацией о конфигурации S3
   */
  getS3Info(): S3Info;

  /**
   * Принудительное переподключение к S3
   *
   * Используется для восстановления соединения после потери связи с S3.
   *
   * @returns {Promise<void>}
   * @throws {Error} Если переподключение не удалось после всех попыток
   */
  reconnect(): Promise<void>;
}

/**
 * Информация о подключении к S3
 *
 * @interface S3Info
 */
export interface S3Info {
  endpoint: string;
  bucket: string;
  region: string;
  isConnected: boolean;
  forcePathStyle: boolean;
}
