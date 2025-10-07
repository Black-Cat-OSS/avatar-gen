import type { Plugin } from 'vite';
import QRCode from 'qrcode';
import { MessageBuffer } from './message-buffer';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Функция для получения версии из package.json
 */
function getPackageVersion(): string {
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    const packageData = JSON.parse(packageContent);
    return packageData.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Кастомный плагин для Vite, который выводит приветственное сообщение при запуске dev сервера
 * @param options - Опции плагина
 * @param options.message - Кастомное сообщение приветствия
 * @param options.color - Цвет сообщения в консоли
 * @returns Vite плагин
 */
export function welcomeMessage(
  options: {
    message?: string;
    color?: 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white';
  } = {},
): Plugin {
  const { message = '🚀 Добро пожаловать в React SDK!', color = 'cyan' } = options;

  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  };

  const resetColor = '\x1b[0m';
  const selectedColor = colors[color];

  return {
    name: 'welcome-message',
    configureServer() {
      // Генерируем QR-код сразу при запуске сервера
      const generateQRCode = async (url: string): Promise<string[]> => {
        try {
          const qrString = await QRCode.toString(url, {
            type: 'terminal',
            small: true,
            width: 1,
            margin: 0,
          });
          return qrString.split('\n').filter(line => line.trim());
        } catch {
          return [];
        }
      };

      // Функция для создания сообщения с использованием буфера
      const createWelcomeMessage = (qrCodeLines: string[]): string => {
        const buffer = new MessageBuffer(80, 35);

        // Рамка отключена для чистого вывода

        // Добавляем основное сообщение (центрированное)
        buffer.addCenteredText(message, 1);

        // Добавляем информацию о версиях
        const reactSDKVersion = getPackageVersion();
        buffer.addCenteredText(
          `📦 React SDK v${reactSDKVersion} | 🔧 Node.js ${process.version}`,
          3,
        );

        // Добавляем информацию о сервере (центрированно)
        buffer.addCenteredText('🌐 Сервер запущен на http://localhost:12965', 4);
        buffer.addCenteredText('📚 Storybook доступен на http://localhost:6006', 5);

        // Добавляем QR-код если есть
        if (qrCodeLines.length > 0) {
          buffer.addCenteredText('📱 QR-код для мобильных устройств:', 7);

          // Размещаем QR-код по центру для лучшего использования пространства
          // Функция для вычисления визуальной ширины без ANSI кодов
          const getVisualWidth = (text: string): number => {
            // Простой способ: удаляем все символы ESC и следующие за ними коды
            let cleanText = text;
            let escIndex = cleanText.indexOf('\x1b');
            while (escIndex !== -1) {
              const endIndex = cleanText.indexOf('m', escIndex);
              if (endIndex !== -1) {
                cleanText = cleanText.slice(0, escIndex) + cleanText.slice(endIndex + 1);
              } else {
                break;
              }
              escIndex = cleanText.indexOf('\x1b');
            }
            return cleanText.length;
          };

          // Находим максимальную визуальную ширину среди всех строк QR-кода
          const qrCodeWidth = Math.max(...qrCodeLines.map(line => getVisualWidth(line)));
          const qrStartColumn = Math.max(0, Math.floor((80 - qrCodeWidth) / 2));

          buffer.addQRCode(qrCodeLines, qrStartColumn, 9);
        }

        // Добавляем финальное сообщение
        const finalMessageLine = qrCodeLines.length > 0 ? 9 + qrCodeLines.length + 2 : 7;
        buffer.addCenteredText('🛠️ Готов к разработке!', finalMessageLine);

        // Добавляем информацию о том, как выйти
        buffer.addCenteredText('💡 Нажмите Ctrl+C или Q для выхода', finalMessageLine + 2);

        // Добавляем пустые строки для лучшего отображения
        const totalHeight = Math.max(
          finalMessageLine + 6,
          qrCodeLines.length > 0 ? 8 + qrCodeLines.length + 7 : finalMessageLine + 6,
        );
        const trimmedBuffer = buffer.slice(0, totalHeight, 0, 80);

        return trimmedBuffer.render(selectedColor, resetColor);
      };

      // Перехватываем stdout для подавления вывода Vite
      const originalStdoutWrite = process.stdout.write;
      let viteOutputSuppressed = false;
      let qrCodeLines: string[] = [];

      // Функция для восстановления оригинального stdout при выходе
      const restoreOriginalOutput = () => {
        process.stdout.write = originalStdoutWrite;
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
          process.stdin.pause();
        }

        // Просто очищаем экран
        originalStdoutWrite.call(process.stdout, '\x1b[2J\x1b[H');
      };

      // Обработчики сигналов завершения процесса
      process.on('SIGINT', () => {
        restoreOriginalOutput();
        process.exit(0);
      }); // Ctrl+C
      process.on('SIGTERM', restoreOriginalOutput); // Сигнал завершения
      process.on('exit', restoreOriginalOutput); // Выход из процесса

      // Обработка ввода с клавиатуры для выхода (упрощенная)
      const handleKeyPress = (key: string) => {
        if (key === 'q' || key === 'Q') {
          restoreOriginalOutput();
          process.exit(0);
        } else if (key === '\u0003') {
          // Ctrl+C
          restoreOriginalOutput();
          process.exit(0);
        }
      };

      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', handleKeyPress);
      }

      // Генерируем QR-код заранее
      generateQRCode('http://192.168.0.103:12965').then(lines => {
        qrCodeLines = lines;
      });

      process.stdout.write = function (
        chunk: string | Buffer | Uint8Array,
        encoding?: BufferEncoding | ((err?: Error | null) => void),
        callback?: (err?: Error | null) => void,
      ) {
        const output = chunk.toString();

        // Подавляем стандартный вывод Vite
        if (
          output.includes('VITE') ||
          output.includes('ready in') ||
          output.includes('Local:') ||
          output.includes('Network:') ||
          output.includes('press h + enter') ||
          output.includes('Visit page on mobile') ||
          output.includes('➜') ||
          output.includes('http://localhost:') ||
          output.includes('http://172.') ||
          output.includes('http://26.') ||
          output.includes('▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄') ||
          output.includes('█')
        ) {
          if (!viteOutputSuppressed) {
            viteOutputSuppressed = true;

            // Очищаем экран перед выводом welcome message
            // Используем более мощные ANSI коды для полной очистки
            originalStdoutWrite.call(this, '\x1b[3J\x1b[2J\x1b[H\x1b[0m');

            // Создаем и выводим сообщение с использованием буфера
            const welcomeMessage = createWelcomeMessage(qrCodeLines);
            originalStdoutWrite.call(this, welcomeMessage);
            originalStdoutWrite.call(this, '\n');
          }
          return true;
        }

        // Обрабатываем сообщения о завершении работы Vite
        if (
          output.includes('stopped') ||
          output.includes('shutting down') ||
          output.includes('server closed') ||
          output.includes('process exited')
        ) {
          // Восстанавливаем оригинальный вывод при завершении
          restoreOriginalOutput();
          if (typeof encoding === 'function') {
            return originalStdoutWrite.call(this, chunk, undefined, encoding);
          }
          return originalStdoutWrite.call(this, chunk, encoding, callback);
        }

        // Пропускаем все остальные сообщения
        if (typeof encoding === 'function') {
          return originalStdoutWrite.call(this, chunk, undefined, encoding);
        }
        return originalStdoutWrite.call(this, chunk, encoding, callback);
      };
    },
  };
}
