// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { SwaggerModule } from '@nestjs/swagger';
import * as swaggerDocument from '../swagger.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  SwaggerModule.setup('api-docs', app, swaggerDocument);
  await app.listen(3000);
}