import { AvatarObject } from './avatar-object.interface';

/**
 * Интерфейс стратегии хранилища
 *
 * Определяет контракт для реализации различных типов хранилищ (local, s3).
 * Используется паттерн Strategy для поддержки различных способов хранения.
 *
 * @interface IStorageStrategy
 */
export interface IStorageStrategy {
  /**
   * Сохранение аватара
   *
   * @param {AvatarObject} avatarObject - Объект аватара для сохранения
   * @returns {Promise<string>} Путь или URL сохраненного аватара
   * @throws {Error} Если сохранение не удалось
   */
  saveAvatar(avatarObject: AvatarObject): Promise<string>;

  /**
   * Загрузка аватара
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<AvatarObject>} Объект аватара
   * @throws {Error} Если аватар не найден или загрузка не удалась
   */
  loadAvatar(id: string): Promise<AvatarObject>;

  /**
   * Удаление аватара
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<void>}
   * @throws {Error} Если удаление не удалось
   */
  deleteAvatar(id: string): Promise<void>;

  /**
   * Проверка существования аватара
   *
   * @param {string} id - Идентификатор аватара
   * @returns {Promise<boolean>} true если аватар существует
   */
  exists(id: string): Promise<boolean>;
}
