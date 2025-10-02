import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { GeneratorService } from './generator.service';

@Module({
  providers: [GeneratorService],
  exports: [GeneratorService],
})
export class GeneratorModule implements OnModuleInit {
  private readonly logger = new Logger(GeneratorModule.name);

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('GeneratorModule initialized - Avatar generation engine ready');
    } catch (error) {
      this.logger.error(
        `GeneratorModule initialization failed: ${error.message}`,
        error.stack,
        'GeneratorModule',
      );
      throw error;
    }
  }
}
