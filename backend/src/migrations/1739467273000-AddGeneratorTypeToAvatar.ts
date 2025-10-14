import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Миграция для добавления поля generatorType в таблицу avatars
 * 
 * Добавляет новое поле generatorType типа varchar(50) с значением по умолчанию 'pixelize'
 * Это поле определяет тип генератора, который использовался для создания аватара
 */
export class AddGeneratorTypeToAvatar1739467273000 implements MigrationInterface {
  name = 'AddGeneratorTypeToAvatar1739467273000';

  /**
   * Применение миграции - добавляет новое поле
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'avatars',
      new TableColumn({
        name: 'generatorType',
        type: 'varchar',
        length: '50',
        default: "'pixelize'",
        isNullable: true,
        comment: 'Тип генератора аватара (pixelize, wave, etc.)',
      }),
    );
  }

  /**
   * Откат миграции - удаляет добавленное поле
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('avatars', 'generatorType');
  }
}
