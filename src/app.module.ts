import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { LoggingModule } from './logging/logging.module';
import { WeatherModule } from './weather/weather.module';
import { ProvidersModule } from './providers/providers.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      autoLoadEntities: true,
      logging: false,
    }),
     CacheModule.register({
      isGlobal: true,
      ttl: parseInt(process.env.CACHE_TTL_SECONDS ?? '300', 10) * 1000,
      max: 100,
    }),
    // 🔹 Global rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_POINTS ?? '30', 10),
      },
    ]),

    LoggingModule,
    ProvidersModule,
    WeatherModule,
  ],
  providers: [
    // 🔹 Apply throttling guard to all routes (per IP)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
