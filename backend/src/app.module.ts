import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}