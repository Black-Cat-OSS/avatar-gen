import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';
import { YamlConfigService } from './config/yaml-config.service';
import { LoggerService } from './modules/logger/logger.service';

async function bootstrap() {
  try {
    console.log('Starting application bootstrap...');

    console.log('Creating NestJS application instance...');
    const app = await NestFactory.create(AppModule);
    console.log('Application instance created');

    // Get configuration and logger services
    console.log('Getting configuration and logger services...');
    const configService = app.get(YamlConfigService);
    console.log('Config service retrieved');

    const loggerService = app.get(LoggerService);
    console.log('Logger service retrieved');

    // Set global logger
    app.useLogger(loggerService);
    console.log('Global logger configured');

    loggerService.log('Application bootstrap completed successfully');

    loggerService.debug('Setting global API prefix...');
    app.setGlobalPrefix('api');

    loggerService.debug('Setting up global validation pipe...');
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    loggerService.debug('Enabling CORS...');
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    loggerService.debug('Setting up Swagger documentation...');
    const config = new DocumentBuilder()
      .setTitle('Avatar Generation API')
      .setDescription('API for generating and managing avatars similar to GitHub/GitLab')
      .setVersion('0.0.1')
      .addTag('Avatar', 'Avatar generation and management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document, {
      customSiteTitle: 'Avatar Generation API',
    });

    // Get server configuration
    const serverConfig = configService.getServerConfig();
    loggerService.debug(`Server configuration: ${JSON.stringify(serverConfig)}`);

    // Start server
    loggerService.log(`Starting server on ${serverConfig.host}:${serverConfig.port}...`);
    await app.listen(serverConfig.port, serverConfig.host);

    loggerService.log(
      `Application is running on: http://${serverConfig.host}:${serverConfig.port}`,
    );
    loggerService.log(
      `Swagger documentation available at: http://${serverConfig.host}:${serverConfig.port}/swagger`,
    );
  } catch (error) {
    console.error(`Failed to start application: ${error.message}`, error);
    process.exit(1);
  }
}

bootstrap();
