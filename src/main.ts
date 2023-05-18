import { config } from 'dotenv';
import { cors } from '@nestjs/platform-express';
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Deployment service')
    .setDescription(
      'Deployment service api part, that includes projects handling'
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.SERVER_PORT!;
  app.use(cors({ origin: false }))
  await app.listen(PORT);
  console.log(`App is listening on port ${PORT}`);
}
bootstrap();
