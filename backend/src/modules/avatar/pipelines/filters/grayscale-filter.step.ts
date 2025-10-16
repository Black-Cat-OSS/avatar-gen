import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { IPipelineStep } from '../../../../common/interfaces/pipeline-step.interface';

/**
 * Шаг pipeline для применения grayscale фильтра
 *
 * Преобразует цветное изображение в оттенки серого.
 *
 * @class GrayscaleFilterStep
 */
@Injectable()
export class GrayscaleFilterStep implements IPipelineStep<Buffer> {
  /**
   * Применить grayscale фильтр к изображению
   *
   * @param {Buffer} imageBuffer - Буфер изображения
   * @returns {Promise<Buffer>} Обработанный буфер изображения
   */
  async process(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer).grayscale().png().toBuffer();
  }
}
