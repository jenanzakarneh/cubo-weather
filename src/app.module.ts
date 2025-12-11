import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingModule } from './logging/logging.module';
import { WeatherModule } from './weather/weather.module';
import { ProvidersModule } from './providers/providers.module';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      autoLoadEntities: true, // entities imported by modules will be picked up
      logging: false,
    }),
    LoggingModule,
    WeatherModule,
    ProvidersModule,
  ],
})
export class AppModule {}
