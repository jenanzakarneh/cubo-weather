import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingService } from './logging.service';
import { WeatherRequestLog } from './entities/weather-request-log.entity';
import { ProviderCallLog } from './entities/provider-call-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WeatherRequestLog, ProviderCallLog])],
  providers: [LoggingService],
  exports: [LoggingService, TypeOrmModule],
})
export class LoggingModule {}
