// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get throttler configuration from app context
  const throttlerGuard = app.get(RateLimitGuard);
  app.useGlobalGuards(throttlerGuard);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();