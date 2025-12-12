import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import {
  ProviderManagerService,
  WEATHER_PROVIDERS,
} from './provider-manager.service';
import { OpenMeteoProvider } from './open-meteo.provider';
import { OpenWeatherProvider } from './openweather.provider';

@Module({
  imports: [LoggingModule],
  providers: [
    ProviderManagerService,
    OpenMeteoProvider,
    OpenWeatherProvider,    {
      provide: WEATHER_PROVIDERS,
      useFactory: (
        openMeteo: OpenMeteoProvider,
        openWeather: OpenWeatherProvider,
      ) => {
        return [openMeteo, openWeather];
      },
      inject: [OpenMeteoProvider, OpenWeatherProvider],
    },
  ],
  exports: [ProviderManagerService],
})
export class ProvidersModule {}
