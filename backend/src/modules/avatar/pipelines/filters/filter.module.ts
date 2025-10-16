import { Module } from '@nestjs/common';
import { FilterService } from './filter.service';
import { GrayscaleFilterStep } from './grayscale-filter.step';
import { SepiaFilterStep } from './sepia-filter.step';
import { NegativeFilterStep } from './negative-filter.step';

/**
 * Модуль для фильтров изображений
 *
 * Регистрирует все filter steps и FilterService для использования
 * в других модулях приложения.
 *
 * @module FilterModule
 */
@Module({
  providers: [
    FilterService,
    GrayscaleFilterStep,
    SepiaFilterStep,
    NegativeFilterStep,
  ],
  exports: [FilterService],
})
export class FilterModule {}
