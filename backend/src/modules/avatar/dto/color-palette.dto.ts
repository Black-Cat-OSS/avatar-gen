import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для представления цветовой палитры
 */
export class ColorPaletteDto {
  @ApiProperty({ 
    description: 'Название палитры',
    example: 'Ocean'
  })
  name: string;

  @ApiProperty({ 
    description: 'Основной цвет в HEX формате',
    example: '#0077BE'
  })
  primaryColor: string;

  @ApiProperty({ 
    description: 'Дополнительный цвет в HEX формате',
    example: '#00A8CC'
  })
  foreignColor: string;

  @ApiProperty({ 
    description: 'Ключ палитры для идентификации',
    example: 'ocean'
  })
  key: string;
}

/**
 * DTO для ответа со списком палитр
 */
export class ColorPalettesResponseDto {
  @ApiProperty({ 
    description: 'Список доступных цветовых палитр',
    type: [ColorPaletteDto]
  })
  palettes: ColorPaletteDto[];
}
