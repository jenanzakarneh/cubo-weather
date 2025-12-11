// src/weather/weather.module.ts
import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [LoggingModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
