import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import { GlobalExceptionFilter } from '@echos/shared/exceptions/exception-handler.filter';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('/api');

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const option = new DocumentBuilder()
    .setTitle('echos')
    .setDescription('echos API descriptions')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, option);
  SwaggerModule.setup('api/doc', app, document);

  await app.listen(app.get(ConfigService).get('port'));
}

bootstrap();
