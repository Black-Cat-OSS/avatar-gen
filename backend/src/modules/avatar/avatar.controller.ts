import {
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Res,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UsePipes,
  Controller,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { AvatarService } from './avatar.service';
import {
  GenerateAvatarDto,
  GetAvatarDto,
  ListAvatarsDto,
} from './dto/generate-avatar.dto';

@ApiTags('Avatar')
@Controller()
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Post('v1/generate')
  @ApiOperation({ summary: 'Generate a new avatar (API v1)' })
  @ApiResponse({ status: 201, description: 'Avatar generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateAvatarV1(@Body() dto: GenerateAvatarDto) {
    try {
      const result = await this.avatarService.generateAvatar(dto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Avatar generated successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health status retrieved' })
  async healthCheck() {
    try {
      const health = await this.avatarService.healthCheck();
      return {
        statusCode: HttpStatus.OK,
        message: 'Health check completed',
        data: health,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of avatars with pagination' })
  @ApiQuery({
    name: 'pick',
    required: false,
    description: 'Number of records to retrieve (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip (default: 0)',
  })
  @ApiResponse({ status: 200, description: 'Avatar list retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async listAvatars(@Query() dto: ListAvatarsDto) {
    try {
      const result = await this.avatarService.listAvatars(dto);
      return {
        statusCode: HttpStatus.OK,
        message: 'Avatar list retrieved successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('color-schemes')
  @ApiOperation({ summary: 'Get available color schemes' })
  @ApiResponse({ status: 200, description: 'Color schemes retrieved successfully' })
  async getColorSchemes() {
    try {
      const schemes = await this.avatarService.getColorSchemes();
      return {
        statusCode: HttpStatus.OK,
        message: 'Color schemes retrieved successfully',
        data: schemes,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete avatar by ID' })
  @ApiParam({ name: 'id', description: 'Avatar ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Avatar deleted successfully' })
  @ApiResponse({ status: 404, description: 'Avatar not found' })
  async deleteAvatar(@Param('id') id: string) {
    try {
      const result = await this.avatarService.deleteAvatar(id);
      return {
        statusCode: HttpStatus.OK,
        message: result.message,
      };
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          statusCode: status,
          message: error.message,
        },
        status,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get avatar by ID' })
  @ApiParam({ name: 'id', description: 'Avatar ID (UUID)' })
  @ApiQuery({
    name: 'filter',
    required: false,
    description: 'Filter to apply (grayscale, sepia, negative)',
  })
  @ApiQuery({ name: 'size', required: false, description: 'Size parameter (4-9, where 2^n)' })
  @ApiResponse({ status: 200, description: 'Avatar retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Avatar not found' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAvatar(@Param('id') id: string, @Query() dto: GetAvatarDto, @Res() res: Response) {
    try {
      const result = await this.avatarService.getAvatar(id, dto);

      res.set({
        'Content-Type': result.contentType,
        'Content-Length': result.image.length.toString(),
        'X-Avatar-ID': result.id,
        'X-Created-At': result.createdAt.toISOString(),
        'X-Version': result.version,
      });

      res.send(result.image);
    } catch (error) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          statusCode: status,
          message: error.message,
        },
        status,
      );
    }
  }
}
