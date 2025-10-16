import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AvatarObject } from '../../../../common/interfaces/avatar-object.interface';
import { IGeneratorStrategy } from '../../../../common/interfaces/generator-strategy.interface';
import { PixelizeGeneratorModule } from '../pixelize-driver';
import { WaveGeneratorModule } from '../wave-driver';

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

}
