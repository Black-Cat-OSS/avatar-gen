import { IsOptional, IsString, MaxLength, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { FilterType } from '../../../common/enums/filter.enum';

//TODO separate to files
export class GenerateAvatarDto {
  @ApiPropertyOptional({ description: 'Primary color for avatar generation' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Foreign color for avatar generation' })
  @IsOptional()
  @IsString()
  foreignColor?: string;

  @ApiPropertyOptional({ description: 'Color scheme name' })
  @IsOptional()
  @IsString()
  colorScheme?: string;

  @ApiPropertyOptional({
    description: 'Generation type (pixelize, wave, etc.)',
    example: 'pixelize',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Seed for avatar generation (max 32 characters)',
    maxLength: 32,
  })
  @IsOptional()
  @IsString()
  @MaxLength(32, { message: 'Seed must not exceed 32 characters' })
  seed?: string;
}

export class GetAvatarDto {
  @ApiPropertyOptional({
    description: 'Filter to apply to the image',
    enum: FilterType,
    example: FilterType.GRAYSCALE,
  })
  @IsOptional()
  @IsEnum(FilterType)
  filter?: FilterType;

  @ApiPropertyOptional({
    description: 'Size parameter (2^n where 4 <= n <= 9)',
    minimum: 4,
    maximum: 9,
    example: 6,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(4)
  @Max(9)
  size?: number;
}

export class ListAvatarsDto {
  @ApiPropertyOptional({
    description: 'Number of records to retrieve (default: 10)',
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  pick?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip (default: 0)',
    minimum: 0,
    example: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  offset?: number;
}
