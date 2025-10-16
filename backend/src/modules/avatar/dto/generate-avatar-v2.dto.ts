import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

/**
 * DTO для генерации градиентного аватара (API v2)
 *
 * Расширяет возможности v1 добавлением обязательного параметра angle
 * для настройки направления градиента.
 *
 * @class GenerateAvatarV2Dto
 */
export class GenerateAvatarV2Dto {
  @ApiPropertyOptional({ description: 'Primary color for gradient generation' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ description: 'Foreign color for gradient generation' })
  @IsOptional()
  @IsString()
  foreignColor?: string;

  @ApiPropertyOptional({ description: 'Color scheme name' })
  @IsOptional()
  @IsString()
  colorScheme?: string;


  @ApiProperty({
    description: 'Gradient rotation angle in degrees (0-360)',
    minimum: 0,
    maximum: 360,
    example: 90,
  })
  @IsNumber({}, { message: 'Angle must be a number' })
  @Min(0, { message: 'Angle must be at least 0 degrees' })
  @Max(360, { message: 'Angle must not exceed 360 degrees' })
  angle: number;
}
