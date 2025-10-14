import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { AvatarObject, ColorScheme } from '../../../../common/interfaces/avatar-object.interface';
import { IGeneratorStrategy } from '../../../../common/interfaces/generator-strategy.interface';

@Injectable()
export class WaveGeneratorModule implements IGeneratorStrategy {
  private readonly logger = new Logger(WaveGeneratorModule.name);

  private readonly colorSchemes: ColorScheme[] = [
    { name: 'green', primaryColor: 'green', foreignColor: 'lightgreen' },
    { name: 'blue', primaryColor: 'blue', foreignColor: 'lightblue' },
    { name: 'red', primaryColor: 'red', foreignColor: 'pink' },
    { name: 'orange', primaryColor: 'orange', foreignColor: 'yellow' },
    { name: 'purple', primaryColor: 'purple', foreignColor: 'violet' },
    { name: 'teal', primaryColor: 'teal', foreignColor: 'cyan' },
    { name: 'indigo', primaryColor: 'indigo', foreignColor: 'blue' },
    { name: 'pink', primaryColor: 'pink', foreignColor: 'rose' },
    { name: 'emerald', primaryColor: 'emerald', foreignColor: 'green' },
  ];

  async generateAvatar(
    primaryColor?: string,
    foreignColor?: string,
    colorScheme?: string,
    seed?: string,
  ): Promise<AvatarObject> {
    this.logger.log('Generating new wave avatar');

    const id = uuidv4();
    const now = new Date();

    // Determine colors
    let finalPrimaryColor = primaryColor;
    let finalForeignColor = foreignColor;

    if (colorScheme) {
      const scheme = this.colorSchemes.find(s => s.name === colorScheme);
      if (scheme) {
        finalPrimaryColor = scheme.primaryColor;
        finalForeignColor = scheme.foreignColor;
      }
    }

    const uniqueSeed = seed ? seed + '-' + Date.now() + '-' + Math.random() : uuidv4();

    // Generate images for all required sizes (4n to 9n)
    const avatarObject: AvatarObject = {
      meta_data_name: id,
      meta_data_created_at: now,
      image_4n: await this.generateImageForSize(
        16,
        finalPrimaryColor,
        finalForeignColor,
        uniqueSeed,
      ), // 2^4 = 16
      image_5n: await this.generateImageForSize(
        32,
        finalPrimaryColor,
        finalForeignColor,
        uniqueSeed,
      ), // 2^5 = 32
      image_6n: await this.generateImageForSize(
        64,
        finalPrimaryColor,
        finalForeignColor,
        uniqueSeed,
      ), // 2^6 = 64
      image_7n: await this.generateImageForSize(
        128,
        finalPrimaryColor,
        finalForeignColor,
        uniqueSeed,
      ), // 2^7 = 128
      image_8n: await this.generateImageForSize(
        256,
        finalPrimaryColor,
        finalForeignColor,
        uniqueSeed,
      ), // 2^8 = 256
      image_9n: await this.generateImageForSize(
        512,
        finalPrimaryColor,
        finalForeignColor,
        uniqueSeed,
      ), // 2^9 = 512
    };

    this.logger.log(`Wave avatar generated with ID: ${id}`);
    return avatarObject;
  }

  private async generateImageForSize(
    size: number,
    primaryColor?: string,
    foreignColor?: string,
    seed?: string,
  ): Promise<Buffer> {
    const canvas = Buffer.alloc(size * size * 4);

    const randomSeed = seed ? this.seedToNumber(seed) : Math.random();
    const rng = this.createSeededRandom(randomSeed);

    // Generate wave parameters
    const frequency1 = 0.1 + rng() * 0.2; // 0.1 to 0.3
    const frequency2 = 0.15 + rng() * 0.25; // 0.15 to 0.4
    const amplitude1 = 0.3 + rng() * 0.4; // 0.3 to 0.7
    const amplitude2 = 0.2 + rng() * 0.3; // 0.2 to 0.5
    const phase1 = rng() * Math.PI * 2;
    const phase2 = rng() * Math.PI * 2;

    const primaryRgb = this.hexToRgb(primaryColor || '#3B82F6');
    const foreignRgb = this.hexToRgb(foreignColor || '#60A5FA');

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;

        // Normalize coordinates to 0-1
        const nx = x / size;
        const ny = y / size;

        // Create wave pattern
        const wave1 = Math.sin(nx * frequency1 * Math.PI * 2 + phase1) * amplitude1;
        const wave2 = Math.sin(ny * frequency2 * Math.PI * 2 + phase2) * amplitude2;
        const combinedWave = (wave1 + wave2) / 2;

        // Create radial pattern
        const centerX = 0.5;
        const centerY = 0.5;
        const distance = Math.sqrt((nx - centerX) ** 2 + (ny - centerY) ** 2);
        const radialPattern = Math.sin(distance * Math.PI * 4) * 0.3;

        // Combine patterns
        const pattern = combinedWave + radialPattern;

        // Determine if pixel should be primary or foreign color
        const isPrimary = pattern > 0;

        const color = isPrimary ? primaryRgb : foreignRgb;

        canvas[index] = color.r;
        canvas[index + 1] = color.g;
        canvas[index + 2] = color.b;
        canvas[index + 3] = 255;
      }
    }

    return await sharp(canvas, {
      raw: {
        width: size,
        height: size,
        channels: 4,
      },
    })
      .png()
      .toBuffer();
  }

  private createSeededRandom(seed: number): () => number {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  private seedToNumber(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Handle named colors
    const namedColors: { [key: string]: string } = {
      green: '#22C55E',
      lightgreen: '#86EFAC',
      blue: '#3B82F6',
      lightblue: '#60A5FA',
      red: '#EF4444',
      pink: '#F472B6',
      purple: '#A855F7',
      violet: '#C084FC',
      orange: '#F97316',
      yellow: '#FDE047',
      teal: '#14B8A6',
      cyan: '#06B6D4',
      indigo: '#6366F1',
      rose: '#F43F5E',
      emerald: '#10B981',
    };

    const color = namedColors[hex.toLowerCase()] || hex;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);

    if (!result) {
      // Default to blue if color is invalid
      return { r: 59, g: 130, b: 246 };
    }

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  getColorSchemes(): ColorScheme[] {
    return this.colorSchemes;
  }
}