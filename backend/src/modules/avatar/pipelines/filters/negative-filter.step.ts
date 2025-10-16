import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { IPipelineStep } from '../../../../common/interfaces/pipeline-step.interface';

/**
 * Шаг pipeline для применения negative фильтра
 *
 * Инвертирует цвета изображения, заменяя прозрачность
 * на белый фон для корректного отображения.
 *
 * @class NegativeFilterStep
 */
@Injectable()
export class NegativeFilterStep implements IPipelineStep<Buffer> {
  /**
   * Применить negative фильтр к изображению
   *
   * @param {Buffer} imageBuffer - Буфер изображения
   * @returns {Promise<Buffer>} Обработанный буфер изображения
   */
  async process(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer)
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Заменяем прозрачность на белый фон
      .negate() // Инвертируем цвета
      .png()
      .toBuffer();
  }
}
