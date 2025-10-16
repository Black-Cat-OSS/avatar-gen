import { Injectable } from '@nestjs/common';
import { IPipelineStep } from '../../../common/interfaces/pipeline-step.interface';

/**
 * Pipeline для обработки изображений
 *
 * Реализует паттерн Pipeline для последовательной обработки изображений
 * через цепочку шагов. Каждый шаг обрабатывает Buffer и передает
 * результат следующему шагу.
 *
 * @class ImagePipeline
 */
@Injectable()
export class ImagePipeline implements IPipelineStep<Buffer> {
  private steps: IPipelineStep<Buffer>[] = [];

  /**
   * Добавить шаг в цепочку обработки
   *
   * @param {IPipelineStep<Buffer>} step - Шаг для добавления в pipeline
   * @returns {this} Возвращает текущий экземпляр для chaining
   */
  addStep(step: IPipelineStep<Buffer>): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Выполнить обработку через все шаги pipeline
   *
   * @param {Buffer} input - Входной буфер изображения
   * @returns {Promise<Buffer>} Обработанный буфер изображения
   */
  async process(input: Buffer): Promise<Buffer> {
    let result = input;

    for (const step of this.steps) {
      result = await step.process(result);
    }

    return result;
  }
}
