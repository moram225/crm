import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import * as redisStore from 'cache-manager-redis-store';
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000, // Time-to-live in milliseconds
        limit: 10, // Maximum number of requests allowed within the TTL
      },
    ]),
    AuthModule,
    TenantsModule,
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}