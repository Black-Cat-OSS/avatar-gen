import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { IPipelineStep } from '../../../../common/interfaces/pipeline-step.interface';

/**
 * Шаг pipeline для применения sepia фильтра
 *
 * Применяет сепию эффект к изображению через модуляцию
 * яркости, насыщенности и оттенка.
 *
 * @class SepiaFilterStep
 */
@Injectable()
export class SepiaFilterStep implements IPipelineStep<Buffer> {
  /**
   * Применить sepia фильтр к изображению
   *
   * @param {Buffer} imageBuffer - Буфер изображения
   * @returns {Promise<Buffer>} Обработанный буфер изображения
   */
  async process(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer)
      .modulate({
        brightness: 1.1,
        saturation: 0.8,
        hue: 30,
      })
      .png()
      .toBuffer();
  }
}
