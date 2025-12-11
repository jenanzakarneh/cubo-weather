import { Module } from '@nestjs/common';
import { ProviderManagerService, WEATHER_PROVIDERS } from './provider-manager.service';
import { LoggingModule } from '../logging/logging.module';
import { MockProvider } from './mock-provider/mock-provider.service';

@Module({
  imports: [LoggingModule],
  providers: [
    MockProvider,
    ProviderManagerService,
    {
      provide: WEATHER_PROVIDERS,
      useFactory: (mockProvider: MockProvider) => {
        return [mockProvider];
      },
      inject: [MockProvider],
    },
  ],
  exports: [ProviderManagerService],
})
export class ProvidersModule {}
