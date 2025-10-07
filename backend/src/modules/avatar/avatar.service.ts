import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { GeneratorService } from './modules';
import {
  GenerateAvatarDto,
  GetAvatarDto,
  ListAvatarsDto,
} from '../../common/dto/generate-avatar.dto';
import { Avatar } from './avatar.entity';

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);

  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
    private readonly avatarGenerator: GeneratorService,
    private readonly storageService: StorageService,
  ) {}

  async generateAvatar(dto: GenerateAvatarDto) {
    this.logger.log('Generating new avatar');

    try {
      // Validate seed length
      if (dto.seed && dto.seed.length > 32) {
        throw new BadRequestException('Seed must not exceed 32 characters');
      }

      // Generate avatar object
      const avatarObject = await this.avatarGenerator.generateAvatar(
        dto.primaryColor,
        dto.foreignColor,
        dto.colorScheme,
        dto.seed,
      );

      // Save to file system
      const filePath = await this.storageService.saveAvatar(avatarObject);

      // Save metadata to database using TypeORM
      const avatar = this.avatarRepository.create({
        id: avatarObject.meta_data_name,
        name: avatarObject.meta_data_name,
        filePath,
        primaryColor: dto.primaryColor,
        foreignColor: dto.foreignColor,
        colorScheme: dto.colorScheme,
        seed: dto.seed,
      });

      const savedAvatar = await this.avatarRepository.save(avatar);

      this.logger.log(`Avatar generated successfully with ID: ${savedAvatar.id}`);

      return {
        id: savedAvatar.id,
        createdAt: savedAvatar.createdAt,
        version: savedAvatar.version,
      };
    } catch (error) {
      this.logger.error(`Failed to generate avatar: ${error.message}`, error);
      throw error;
    }
  }

  async getAvatar(id: string, dto: GetAvatarDto) {
    this.logger.log(`Retrieving avatar with ID: ${id}`);

    try {
      // Validate size parameter
      if (dto.size && (dto.size < 4 || dto.size > 9)) {
        throw new BadRequestException('Size must be between 4 and 9 (2^n where 4 <= n <= 9)');
      }

      // Get avatar from database using TypeORM
      const avatar = await this.avatarRepository.findOne({
        where: { id },
      });

      if (!avatar) {
        throw new NotFoundException(`Avatar with ID ${id} not found`);
      }

      // Load avatar object from file
      const avatarObject = await this.storageService.loadAvatar(id);

      // Determine which image size to use
      const sizeKey = dto.size ? `image_${dto.size}n` : 'image_6n';
      let imageBuffer = avatarObject[sizeKey as keyof typeof avatarObject] as Buffer;

      // Apply filter if specified
      if (dto.filter) {
        imageBuffer = await this.avatarGenerator.applyFilter(imageBuffer, dto.filter);
      }

      this.logger.log(`Avatar retrieved successfully: ${id}`);

      return {
        id: avatar.id,
        image: imageBuffer,
        contentType: 'image/png',
        createdAt: avatar.createdAt,
        version: avatar.version,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get avatar: ${error.message}`, error);
      throw new Error(`Failed to get avatar: ${error.message}`);
    }
  }

  async deleteAvatar(id: string) {
    this.logger.log(`Deleting avatar with ID: ${id}`);

    try {
      // Check if avatar exists in database using TypeORM
      const avatar = await this.avatarRepository.findOne({
        where: { id },
      });

      if (!avatar) {
        throw new NotFoundException(`Avatar with ID ${id} not found`);
      }

      // Delete from file system
      await this.storageService.deleteAvatar(id);

      // Delete from database using TypeORM
      await this.avatarRepository.remove(avatar);

      this.logger.log(`Avatar deleted successfully: ${id}`);

      return { message: 'Avatar deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete avatar: ${error.message}`, error);
      throw new Error(`Failed to delete avatar: ${error.message}`);
    }
  }

  async getColorSchemes() {
    return this.avatarGenerator.getColorSchemes();
  }

  async listAvatars(dto: ListAvatarsDto) {
    this.logger.log('Retrieving avatar list');

    try {
      const pick = dto.pick || 10;
      const offset = dto.offset || 0;

      // Use TypeORM query builder for pagination
      const [avatars, total] = await this.avatarRepository.findAndCount({
        take: pick,
        skip: offset,
        order: {
          createdAt: 'ASC',
        },
        select: [
          'id',
          'name',
          'createdAt',
          'version',
          'primaryColor',
          'foreignColor',
          'colorScheme',
          'seed',
        ],
      });

      this.logger.log(`Retrieved ${avatars.length} avatars from ${offset} offset`);

      return {
        avatars,
        pagination: {
          total,
          offset,
          pick,
          hasMore: offset + pick < total,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to list avatars: ${error.message}`, error);
      throw new Error(`Failed to list avatars: ${error.message}`);
    }
  }

  async healthCheck() {
    // Простая проверка подключения к репозиторию
    const dbHealth = await this.avatarRepository.count();
    return {
      database: dbHealth,
      status: dbHealth ? 'healthy' : 'unhealthy',
    };
  }
}
