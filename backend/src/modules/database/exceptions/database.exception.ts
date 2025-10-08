/**
 * Базовый класс для всех исключений базы данных
 *
 * Предоставляет общую структуру для специфичных ошибок БД.
 *
 * @class DatabaseException
 * @extends {Error}
 */
export class DatabaseException extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Исключение при отсутствии директории для базы данных SQLite
 *
 * @class SqliteDirectoryNotFoundException
 * @extends {DatabaseException}
 */
export class SqliteDirectoryNotFoundException extends DatabaseException {
  constructor(public readonly directoryPath: string) {
    const message = `SQLite database directory does not exist: ${directoryPath}`;
    super(message, { directoryPath });
  }
}

/**
 * Исключение при отсутствии файла базы данных SQLite
 *
 * @class SqliteDatabaseFileNotFoundException
 * @extends {DatabaseException}
 */
export class SqliteDatabaseFileNotFoundException extends DatabaseException {
  constructor(public readonly filePath: string) {
    const message = `SQLite database file does not exist: ${filePath}`;
    super(message, { filePath });
  }
}

/**
 * Исключение при недостаточных правах доступа к директории SQLite
 *
 * @class SqliteDirectoryPermissionException
 * @extends {DatabaseException}
 */
export class SqliteDirectoryPermissionException extends DatabaseException {
  constructor(
    public readonly directoryPath: string,
    public readonly permissions: string,
    public readonly owner: string,
    public readonly processInfo: string,
  ) {
    const message = `No write permission for SQLite directory: ${directoryPath} (perms: ${permissions}, process: ${processInfo})`;
    super(message, { directoryPath, permissions, owner, processInfo });
  }
}

/**
 * Исключение при недостаточных правах доступа к файлу SQLite
 *
 * @class SqliteDatabaseFilePermissionException
 * @extends {DatabaseException}
 */
export class SqliteDatabaseFilePermissionException extends DatabaseException {
  constructor(
    public readonly filePath: string,
    public readonly permissions: string,
    public readonly owner: string,
    public readonly processInfo: string,
  ) {
    const message = `Insufficient permissions for SQLite database file: ${filePath} (perms: ${permissions}, process: ${processInfo})`;
    super(message, { filePath, permissions, owner, processInfo });
  }
}

/**
 * Исключение при ошибке подключения к базе данных
 *
 * @class DatabaseConnectionException
 * @extends {DatabaseException}
 */
export class DatabaseConnectionException extends DatabaseException {
  constructor(
    public readonly driver: string,
    message: string,
    public readonly originalError?: Error,
  ) {
    super(`${driver} connection error: ${message}`, {
      driver,
      originalError: originalError?.message,
    });
  }
}
