import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './avatar.entity';

/**
 * Модуль для работы с сущностью Avatar
 *
 * Предоставляет глобальный доступ к TypeORM репозиторию для сущности Avatar.
 * Модуль является глобальным, что позволяет использовать Avatar репозиторий
 * в любом другом модуле без необходимости импорта AvatarModule.
 *
 * @example
 * ```typescript
 * // В любом сервисе
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @InjectRepository(Avatar)
 *     private readonly avatarRepository: Repository<Avatar>,
 *   ) {}
 * }
 * ```
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Avatar])],
  exports: [TypeOrmModule],
})
export class AvatarModule {}