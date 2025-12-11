import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { LoggingModule } from '../logging/logging.module';
import { ProvidersModule } from 'src/providers/providers.module';

@Module({
  imports: [LoggingModule,ProvidersModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
