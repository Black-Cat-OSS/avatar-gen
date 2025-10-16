import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AvatarObject } from '../../../../common/interfaces/avatar-object.interface';
import { IGeneratorStrategy } from '../../../../common/interfaces/generator-strategy.interface';
import { PixelizeGeneratorModule } from '../pixelize-driver';
import { WaveGeneratorModule } from '../wave-driver';
import { FilterType } from '../../../../common/enums/filter.enum';
import sharp from 'sharp';

/**
 * Главный сервис генерации аватаров
 *
 * Использует паттерн Strategy для поддержки различных типов генерации.
 * Выбор стратегии происходит на основе параметра type.
 *
 * @class GeneratorService
 */
@Injectable()
export class GeneratorService {
  private readonly logger = new Logger(GeneratorService.name);

  constructor(
    private readonly pixelizeGenerator: PixelizeGeneratorModule,
    private readonly waveGenerator: WaveGeneratorModule,
  ) {}

  async generateAvatar(
    primaryColor?: string,
    foreignColor?: string,
    colorScheme?: string,
    seed?: string,
    type: string = 'pixelize',
  ): Promise<AvatarObject> {
    this.logger.log(`Generating avatar with type: ${type}`);

    const generator = this.getGenerator(type);
    return await generator.generateAvatar(primaryColor, foreignColor, colorScheme, seed);
  }

  getColorSchemes(
    type: string = 'pixelize',
  ): Array<{ name: string; primaryColor: string; foreignColor: string }> {
    const generator = this.getGenerator(type);
    return generator.getColorSchemes();
  }

  private getGenerator(type: string): IGeneratorStrategy {
    switch (type.toLowerCase()) {
      case 'pixelize':
        return this.pixelizeGenerator;
      case 'wave':
        return this.waveGenerator;
      default:
        throw new BadRequestException(`Unsupported generator type: ${type}`);
    }
  }

  async applyFilter(imageBuffer: Buffer, filter: FilterType): Promise<Buffer> {
    this.logger.log(`Applying filter: ${filter}`);

    try {
      switch (filter) {
        case FilterType.GRAYSCALE:
          return await sharp(imageBuffer).grayscale().png().toBuffer();

        case FilterType.SEPIA:
          return await sharp(imageBuffer)
            .modulate({
              brightness: 1.1,
              saturation: 0.8,
              hue: 30,
            })
            .png()
            .toBuffer();

        case FilterType.NEGATIVE: {
          this.logger.log('Applying negative filter');
          // Решаем проблему с альфа-каналом через удаление альфа-канала с белым фоном
          const result = await sharp(imageBuffer)
            .flatten({ background: { r: 255, g: 255, b: 255 } }) // Заменяем прозрачность на белый фон
            .negate() // Инвертируем цвета (белый станет черным)
            .png()
            .toBuffer();
          this.logger.log(
            `Negative filter applied (with white background), result size: ${result.length} bytes`,
          );
          return result;
        }

        default:
          return imageBuffer;
      }
    } catch (error) {
      this.logger.error(`Failed to apply filter ${filter}: ${error.message}`, error);
      throw error;
    }
  }
}
