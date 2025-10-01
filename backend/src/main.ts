import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './modules/app/app.module';
import { YamlConfigService } from './config/yaml-config.service';
import { LoggerService } from './modules/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // Use our custom logger
  });

  // Get configuration service
  const configService = app.get(YamlConfigService);
  const logger = app.get(LoggerService);

  // Set global logger
  app.useLogger(logger);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Avatar Generation API')
    .setDescription('API for generating and managing avatars similar to GitHub/GitLab')
    .setVersion('0.0.1')
    .addTag('Avatar', 'Avatar generation and management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    customSiteTitle: 'Avatar Generation API',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Get server configuration
  const serverConfig = configService.getServerConfig();
  
  // Start server
  await app.listen(serverConfig.port, serverConfig.host);
  
  logger.log(`Application is running on: http://${serverConfig.host}:${serverConfig.port}`);
  logger.log(`Swagger documentation available at: http://${serverConfig.host}:${serverConfig.port}/swagger`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

