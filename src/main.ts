import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const PORT = process.env.SERVER_PORT!;
  await app.listen(PORT);
  console.log(`App is listening on port ${PORT}`);
}
bootstrap();
