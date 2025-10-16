import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './avatar.entity';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { GeneratorModule } from './modules/generator';
import { StorageModule } from '../storage/storage.module';
import { FilterModule } from './pipelines/filters/filter.module';

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
  imports: [
    TypeOrmModule.forFeature([Avatar]), 
    StorageModule.register(),
    GeneratorModule.register(),
    FilterModule,
  ],
  controllers: [AvatarController],
  providers: [AvatarService],
  exports: [TypeOrmModule],
})
export class AvatarModule {}
