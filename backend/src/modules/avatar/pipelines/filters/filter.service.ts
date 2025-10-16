import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { FilterType } from '../../../../common/enums/filter.enum';
import { GrayscaleFilterStep } from './grayscale-filter.step';
import { SepiaFilterStep } from './sepia-filter.step';
import { NegativeFilterStep } from './negative-filter.step';

/**
 * Сервис для применения фильтров к изображениям
 *
 * Использует паттерн Strategy для выбора нужного фильтра.
 * Применяет только один фильтр за раз (без комбинирования).
 *
 * @class FilterService
 */
@Injectable()
export class FilterService {
  private readonly logger = new Logger(FilterService.name);

  constructor(
    private readonly grayscaleFilterStep: GrayscaleFilterStep,
    private readonly sepiaFilterStep: SepiaFilterStep,
    private readonly negativeFilterStep: NegativeFilterStep,
  ) {}

  /**
   * Применить фильтр к изображению
   *
   * @param {Buffer} imageBuffer - Буфер изображения
   * @param {FilterType} filterType - Тип фильтра для применения
   * @returns {Promise<Buffer>} Обработанный буфер изображения
   * @throws {BadRequestException} Если тип фильтра не поддерживается
   */
  async applyFilter(imageBuffer: Buffer, filterType: FilterType): Promise<Buffer> {
    this.logger.log(`Applying filter: ${filterType}`);

    try {
      switch (filterType) {
        case FilterType.GRAYSCALE:
          return await this.grayscaleFilterStep.process(imageBuffer);

        case FilterType.SEPIA:
          return await this.sepiaFilterStep.process(imageBuffer);

        case FilterType.NEGATIVE:
          return await this.negativeFilterStep.process(imageBuffer);

        default:
          throw new BadRequestException(`Unsupported filter type: ${filterType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to apply filter ${filterType}: ${error.message}`, error);
      throw error;
    }
  }
}
