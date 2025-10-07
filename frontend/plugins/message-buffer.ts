/**
 * Класс для управления буфером сообщений в виде матрицы символов
 */
export class MessageBuffer {
  private buffer: string[][];
  private width: number;
  private height: number;

  constructor(width: number = 80, height: number = 25) {
    this.width = width;
    this.height = height;
    this.buffer = Array(height)
      .fill(null)
      .map(() => Array(width).fill(' '));
  }

  /**
   * Очищает буфер
   */
  clear(): void {
    this.buffer = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(' '));
  }

  /**
   * Добавляет текст в буфер на указанной позиции
   */
  addText(text: string, column: number = 0, line: number = 0): void {
    const chars = text.split('');
    for (let i = 0; i < chars.length && column + i < this.width && line < this.height; i++) {
      if (column + i >= 0 && line >= 0) {
        this.buffer[line][column + i] = chars[i];
      }
    }
  }

  /**
   * Добавляет горизонтальную линию
   */
  addHorizontalLine(
    line: number,
    startColumn: number = 0,
    endColumn: number = this.width - 1,
    char: string = '─',
  ): void {
    if (line >= 0 && line < this.height) {
      for (
        let column = Math.max(0, startColumn);
        column <= Math.min(endColumn, this.width - 1);
        column++
      ) {
        this.buffer[line][column] = char;
      }
    }
  }

  /**
   * Добавляет вертикальную линию
   */
  addVerticalLine(
    column: number,
    startLine: number = 0,
    endLine: number = this.height - 1,
    char: string = '│',
  ): void {
    if (column >= 0 && column < this.width) {
      for (let line = Math.max(0, startLine); line <= Math.min(endLine, this.height - 1); line++) {
        this.buffer[line][column] = char;
      }
    }
  }

  /**
   * Добавляет рамку вокруг буфера
   */
  addBorder(): void {
    // Верхняя и нижняя границы
    this.addHorizontalLine(0, 0, this.width - 1, '─');
    this.addHorizontalLine(this.height - 1, 0, this.width - 1, '─');

    // Левая и правая границы
    this.addVerticalLine(0, 0, this.height - 1, '│');
    this.addVerticalLine(this.width - 1, 0, this.height - 1, '│');

    // Углы
    this.setChar(0, 0, '┌');
    this.setChar(this.width - 1, 0, '┐');
    this.setChar(0, this.height - 1, '└');
    this.setChar(this.width - 1, this.height - 1, '┘');
  }

  /**
   * Устанавливает символ в конкретной позиции
   */
  setChar(column: number, line: number, char: string): void {
    if (column >= 0 && column < this.width && line >= 0 && line < this.height) {
      this.buffer[line][column] = char;
    }
  }

  /**
   * Добавляет QR-код в буфер
   */
  addQRCode(qrLines: string[], startColumn: number = 2, startLine: number = 0): void {
    qrLines.forEach((line, index) => {
      const currentLine = startLine + index;
      if (currentLine < this.height) {
        if (index === qrLines.length - 2) {
          line = '\x1b[37m▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀\x1b[0m';
        }

        this.addText(line, startColumn, currentLine);
      }
    });
  }

  /**
   * Центрирует текст по горизонтали
   */
  addCenteredText(text: string, line: number): void {
    const column = Math.max(0, Math.floor((this.width - text.length) / 2));
    this.addText(text, column, line);
  }

  /**
   * Рендерит буфер в строку с применением цветов
   */
  render(color: string, resetColor: string): string {
    return this.buffer
      .map(row => row.join(''))
      .reduce((acc, line) => {
        // Обрезаем пробелы в конце строки, но сохраняем структуру
        const trimmedLine = line.replace(/\s+$/, '');
        // Добавляем цвет только если строка не пустая
        if (trimmedLine.length > 0) {
          return acc + `${color}${trimmedLine}${resetColor}\n`;
        }
        return acc + '\n';
      }, '');
  }

  /**
   * Возвращает текущую высоту буфера (количество непустых строк)
   */
  getActualHeight(): number {
    return this.buffer.reduce((height, row, index) => {
      const hasContent = row.some(char => char !== ' ');
      return hasContent ? index + 1 : height;
    }, 0);
  }

  /**
   * Возвращает срез буфера (часть строк или столбцов)
   */
  slice(
    startLine: number = 0,
    endLine?: number,
    startColumn: number = 0,
    endColumn?: number,
  ): MessageBuffer {
    const actualEndLine = endLine ?? this.height;
    const actualEndColumn = endColumn ?? this.width;
    const slicedHeight = actualEndLine - startLine;
    const slicedWidth = actualEndColumn - startColumn;

    const slicedBuffer = new MessageBuffer(slicedWidth, slicedHeight);

    for (let line = 0; line < slicedHeight; line++) {
      const sourceLine = startLine + line;
      if (sourceLine >= 0 && sourceLine < this.height) {
        for (let column = 0; column < slicedWidth; column++) {
          const sourceColumn = startColumn + column;
          if (sourceColumn >= 0 && sourceColumn < this.width) {
            slicedBuffer.setChar(column, line, this.buffer[sourceLine][sourceColumn]);
          }
        }
      }
    }

    return slicedBuffer;
  }

  /**
   * Добавляет вертикальную линию с использованием reduce для обработки массива символов
   */
  addVerticalLineWithReduce(
    column: number,
    startLine: number = 0,
    endLine: number = this.height - 1,
    char: string = '│',
  ): void {
    if (column >= 0 && column < this.width) {
      const lineRange = Array.from({ length: endLine - startLine + 1 }, (_, i) => startLine + i);
      lineRange.reduce((acc, line) => {
        if (line >= 0 && line < this.height) {
          this.buffer[line][column] = char;
        }
        return acc + 1;
      }, 0);
    }
  }

  /**
   * Добавляет горизонтальную линию с использованием reduce для обработки массива символов
   */
  addHorizontalLineWithReduce(
    line: number,
    startColumn: number = 0,
    endColumn: number = this.width - 1,
    char: string = '─',
  ): void {
    if (line >= 0 && line < this.height) {
      const columnRange = Array.from(
        { length: endColumn - startColumn + 1 },
        (_, i) => startColumn + i,
      );
      columnRange.reduce((acc, column) => {
        if (column >= 0 && column < this.width) {
          this.buffer[line][column] = char;
        }
        return acc + 1;
      }, 0);
    }
  }

  /**
   * Объединяет несколько буферов горизонтально
   */
  static concatHorizontal(...buffers: MessageBuffer[]): MessageBuffer {
    const totalWidth = buffers.reduce((sum, buffer) => sum + buffer.width, 0);
    const maxHeight = Math.max(...buffers.map(buffer => buffer.height));

    const result = new MessageBuffer(totalWidth, maxHeight);
    let currentColumn = 0;

    buffers.forEach(buffer => {
      for (let line = 0; line < buffer.height && line < maxHeight; line++) {
        for (let column = 0; column < buffer.width; column++) {
          result.setChar(currentColumn + column, line, buffer.buffer[line][column]);
        }
      }
      currentColumn += buffer.width;
    });

    return result;
  }

  /**
   * Объединяет несколько буферов вертикально
   */
  static concatVertical(...buffers: MessageBuffer[]): MessageBuffer {
    const maxWidth = Math.max(...buffers.map(buffer => buffer.width));
    const totalHeight = buffers.reduce((sum, buffer) => sum + buffer.height, 0);

    const result = new MessageBuffer(maxWidth, totalHeight);
    let currentLine = 0;

    buffers.forEach(buffer => {
      for (let line = 0; line < buffer.height; line++) {
        for (let column = 0; column < buffer.width && column < maxWidth; column++) {
          result.setChar(column, currentLine + line, buffer.buffer[line][column]);
        }
      }
      currentLine += buffer.height;
    });

    return result;
  }
}
