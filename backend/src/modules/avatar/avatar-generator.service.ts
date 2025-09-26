import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { AvatarObject, ColorScheme } from '../../common/interfaces/avatar-object.interface';
import { FilterType } from '../../common/enums/filter.enum';

@Injectable()
export class AvatarGeneratorService {
  private readonly logger = new Logger(AvatarGeneratorService.name);
  
  private readonly colorSchemes: ColorScheme[] = [
    { name: 'green', primaryColor: 'green', foreignColor: 'lightgreen' },
    { name: 'blue', primaryColor: 'blue', foreignColor: 'lightblue' },
    { name: 'red', primaryColor: 'red', foreignColor: 'pink' },
    { name: 'purple', primaryColor: 'purple', foreignColor: 'violet' },
    { name: 'orange', primaryColor: 'orange', foreignColor: 'yellow' },
  ];

  async generateAvatar(
    primaryColor?: string,
    foreignColor?: string,
    colorScheme?: string,
    seed?: string,
  ): Promise<AvatarObject> {
    this.logger.log('Generating new avatar');
    
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
    
    // Generate images for all required sizes (4n to 9n)
    const avatarObject: AvatarObject = {
      meta_data_name: id,
      meta_data_created_at: now,
      image_4n: await this.generateImageForSize(16, finalPrimaryColor, finalForeignColor, seed), // 2^4 = 16
      image_5n: await this.generateImageForSize(32, finalPrimaryColor, finalForeignColor, seed), // 2^5 = 32
      image_6n: await this.generateImageForSize(64, finalPrimaryColor, finalForeignColor, seed), // 2^6 = 64
      image_7n: await this.generateImageForSize(128, finalPrimaryColor, finalForeignColor, seed), // 2^7 = 128
      image_8n: await this.generateImageForSize(256, finalPrimaryColor, finalForeignColor, seed), // 2^8 = 256
      image_9n: await this.generateImageForSize(512, finalPrimaryColor, finalForeignColor, seed), // 2^9 = 512
    };
    
    this.logger.log(`Avatar generated with ID: ${id}`);
    return avatarObject;
  }

  private async generateImageForSize(
    size: number,
    primaryColor?: string,
    foreignColor?: string,
    seed?: string,
  ): Promise<Buffer> {
    // Create a simple geometric avatar pattern
    const canvas = Buffer.alloc(size * size * 4); // RGBA
    
    // Use seed for deterministic generation if provided
    const randomSeed = seed ? this.seedToNumber(seed) : Math.random();
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        
        // Create a pattern based on position and seed
        const pattern = this.generatePattern(x, y, size, randomSeed);
        
        if (pattern === 0) {
          // Primary color
          const color = this.hexToRgb(primaryColor || '#3B82F6');
          canvas[index] = color.r;     // R
          canvas[index + 1] = color.g; // G
          canvas[index + 2] = color.b; // B
          canvas[index + 3] = 255;     // A (no alpha channel as per requirements)
        } else {
          // Foreign color
          const color = this.hexToRgb(foreignColor || '#60A5FA');
          canvas[index] = color.r;     // R
          canvas[index + 1] = color.g; // G
          canvas[index + 2] = color.b; // B
          canvas[index + 3] = 255;     // A
        }
      }
    }
    
    // Convert to PNG using Sharp
    return await sharp(canvas, {
      raw: {
        width: size,
        height: size,
        channels: 4,
      },
    }).png().toBuffer();
  }

  private generatePattern(x: number, y: number, size: number, seed: number): number {
    // Create a deterministic pattern based on position and seed
    const normalizedX = x / size;
    const normalizedY = y / size;
    
    // Use seed to modify the pattern
    const modifiedX = (normalizedX + seed) % 1;
    const modifiedY = (normalizedY + seed * 0.7) % 1;
    
    // Create a geometric pattern (circles and squares)
    const centerX = 0.5;
    const centerY = 0.5;
    const distance = Math.sqrt(
      Math.pow(modifiedX - centerX, 2) + Math.pow(modifiedY - centerY, 2)
    );
    
    // Alternating pattern based on distance and position
    const pattern = Math.floor(distance * 8 + modifiedX * 4 + modifiedY * 2) % 2;
    return pattern;
  }

  private seedToNumber(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Handle named colors
    const namedColors: { [key: string]: string } = {
      'green': '#22C55E',
      'lightgreen': '#86EFAC',
      'blue': '#3B82F6',
      'lightblue': '#60A5FA',
      'red': '#EF4444',
      'pink': '#F472B6',
      'purple': '#A855F7',
      'violet': '#C084FC',
      'orange': '#F97316',
      'yellow': '#FDE047',
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
        return await sharp(imageBuffer)
          .negate()
          .png()
          .toBuffer();
      
      default:
        return imageBuffer;
    }
  }

  getColorSchemes(): ColorScheme[] {
    return this.colorSchemes;
  }
}

