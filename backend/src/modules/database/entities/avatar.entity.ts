import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * Сущность Avatar для TypeORM
 * 
 * Соответствует Prisma модели Avatar с теми же полями и ограничениями.
 * Использует TypeORM декораторы для определения структуры таблицы.
 * 
 * @class Avatar
 */
@Entity('avatars')
export class Avatar {
  /**
   * Уникальный идентификатор аватара
   * Генерируется автоматически как UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Название аватара
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * Дата и время создания записи
   * Устанавливается автоматически при создании
   */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  /**
   * Версия аватара
   * По умолчанию "0.0.1"
   */
  @Column({ type: 'varchar', length: 50, default: '0.0.1' })
  version: string;

  /**
   * Путь к файлу аватара
   * Должен быть уникальным
   */
  @Column({ type: 'varchar', length: 500, unique: true })
  @Index('IDX_avatar_file_path')
  filePath: string;

  /**
   * Основной цвет аватара
   * Опциональное поле
   */
  @Column({ type: 'varchar', length: 7, nullable: true })
  primaryColor?: string;

  /**
   * Дополнительный цвет аватара
   * Опциональное поле
   */
  @Column({ type: 'varchar', length: 7, nullable: true })
  foreignColor?: string;

  /**
   * Цветовая схема аватара
   * Опциональное поле
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  colorScheme?: string;

  /**
   * Seed для генерации аватара
   * Опциональное поле
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  seed?: string;
}
