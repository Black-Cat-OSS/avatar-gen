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

  getColorSchemes(type: string = 'pixelize'): Array<{ name: string; primaryColor: string; foreignColor: string }> {
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

      case FilterType.NEGATIVE:
        return await sharp(imageBuffer).negate().png().toBuffer();

      default:
        return imageBuffer;
    }
  }
}
