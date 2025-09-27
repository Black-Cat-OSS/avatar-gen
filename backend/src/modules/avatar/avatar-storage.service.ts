import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { AvatarObject } from '../../common/interfaces/avatar-object.interface';
import { YamlConfigService } from '../../config/yaml-config.service';

@Injectable()
export class AvatarStorageService {
  private readonly logger = new Logger(AvatarStorageService.name);

  constructor(private readonly configService: YamlConfigService) {}

  async saveAvatar(avatarObject: AvatarObject): Promise<string> {
    const id = avatarObject.meta_data_name;
    const filePath = this.getFilePath(id);
    
    try {
      // Ensure directory exists
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }

      // Serialize and save the object
      const serializedData = JSON.stringify({
        ...avatarObject,
        image_4n: Array.from(avatarObject.image_4n),
        image_5n: Array.from(avatarObject.image_5n),
        image_6n: Array.from(avatarObject.image_6n),
        image_7n: Array.from(avatarObject.image_7n),
        image_8n: Array.from(avatarObject.image_8n),
        image_9n: Array.from(avatarObject.image_9n),
      });

      writeFileSync(filePath, serializedData);
      this.logger.log(`Avatar saved to: ${filePath}`);
      
      return filePath;
    } catch (error) {
      this.logger.error(`Failed to save avatar: ${error.message}`, error);
      throw new Error(`Failed to save avatar: ${error.message}`);
    }
  }

  async loadAvatar(id: string): Promise<AvatarObject> {
    const filePath = this.getFilePath(id);
    
    try {
      if (!existsSync(filePath)) {
        throw new NotFoundException(`Avatar with ID ${id} not found`);
      }

      const fileContent = readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      // Deserialize the object
      const avatarObject: AvatarObject = {
        meta_data_name: data.meta_data_name,
        meta_data_created_at: new Date(data.meta_data_created_at),
        image_4n: Buffer.from(data.image_4n),
        image_5n: Buffer.from(data.image_5n),
        image_6n: Buffer.from(data.image_6n),
        image_7n: Buffer.from(data.image_7n),
        image_8n: Buffer.from(data.image_8n),
        image_9n: Buffer.from(data.image_9n),
      };

      this.logger.log(`Avatar loaded from: ${filePath}`);
      return avatarObject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to load avatar: ${error.message}`, error);
      throw new Error(`Failed to load avatar: ${error.message}`);
    }
  }

  async deleteAvatar(id: string): Promise<void> {
    const filePath = this.getFilePath(id);
    
    try {
      if (existsSync(filePath)) {
        const fs = await import('fs');
        fs.unlinkSync(filePath);
        this.logger.log(`Avatar deleted: ${filePath}`);
      } else {
        throw new NotFoundException(`Avatar with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete avatar: ${error.message}`, error);
      throw new Error(`Failed to delete avatar: ${error.message}`);
    }
  }

  private getFilePath(id: string): string {
    const savePath = this.configService.getSavePath();
    return join(savePath, `${id}.obj`);
  }
}

