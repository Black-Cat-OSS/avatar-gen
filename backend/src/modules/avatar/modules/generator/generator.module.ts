import { Module, DynamicModule } from '@nestjs/common';
import { PixelizeGeneratorModule } from '../pixelize-driver';
import { WaveGeneratorModule } from '../wave-driver';
import { GradientGeneratorModule } from '../gradient-driver/gradient-generator.module';
import { GeneratorService } from './generator.service';

/**
 * Главный модуль генераторов аватаров
 *
 * Динамически подключает все доступные драйверы генераторов.
 * Использует паттерн Strategy для поддержки различных типов генерации.
 *
 * @module GeneratorModule
 */
@Module({})
export class GeneratorModule {
  /**
   * Регистрация модуля с подключением всех драйверов генераторов
   *
   * @static
   * @returns {DynamicModule} Динамический модуль
   */
  static register(): DynamicModule {
    return {
      module: GeneratorModule,
      providers: [
        GeneratorService,
        PixelizeGeneratorModule,
        WaveGeneratorModule,
        GradientGeneratorModule,
      ],
      exports: [GeneratorService],
    };
  }
}
