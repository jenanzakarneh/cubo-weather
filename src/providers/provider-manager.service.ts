import { Injectable, ServiceUnavailableException, Inject } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { ProviderResult, WeatherProvider } from './interfaces/weather-provider.interface';

export const WEATHER_PROVIDERS = 'WEATHER_PROVIDERS';

export interface ProviderManagerResult {
  result: ProviderResult;
  isFallback: boolean; // true if primary failed and a later provider was used
}

@Injectable()
export class ProviderManagerService {
  constructor(
    @Inject(WEATHER_PROVIDERS)
    private readonly providers: WeatherProvider[],
    private readonly loggingService: LoggingService,
  ) {}

  private async callProvider<T extends keyof WeatherProvider>(
    provider: WeatherProvider,
    method: 'getByCoords' | 'getByCity',
    args: any[],
  ): Promise<ProviderResult> {
    const start = Date.now();
    try {
      // @ts-ignore - method is one of the keys we declared
      const result: ProviderResult = await provider[method](...args);
      const latency = Date.now() - start;

      await this.loggingService.logProviderCall({
        provider_name: provider.name,
        request_payload: { method, args },
        response_payload: result,
        success: true,
        latency_ms: latency,
      });

      return result;
    } catch (error: any) {
      const latency = Date.now() - start;

      await this.loggingService.logProviderCall({
        provider_name: provider.name,
        request_payload: { method, args },
        response_payload: null,
        success: false,
        latency_ms: latency,
        error_message: error?.message ?? 'Unknown provider error',
      });

      throw error;
    }
  }

  async getByCoords(lat: number, lon: number): Promise<ProviderManagerResult> {
    if (!this.providers.length) {
      throw new ServiceUnavailableException('No weather providers configured');
    }

    let lastError: any;
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      try {
        const result = await this.callProvider(provider, 'getByCoords', [lat, lon]);
        return { result, isFallback: i > 0 };
      } catch (err) {
        lastError = err;
        // try next provider
      }
    }

    // all providers failed
    throw new ServiceUnavailableException(
      `All providers failed. Last error: ${lastError?.message ?? 'unknown'}`,
    );
  }

  async getByCity(city: string): Promise<ProviderManagerResult> {
    if (!this.providers.length) {
      throw new ServiceUnavailableException('No weather providers configured');
    }

    let lastError: any;
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      try {
        const result = await this.callProvider(provider, 'getByCity', [city]);
        return { result, isFallback: i > 0 };
      } catch (err) {
        lastError = err;
        // try next provider
      }
    }

    // all providers failed
    throw new ServiceUnavailableException(
      `All providers failed. Last error: ${lastError?.message ?? 'unknown'}`,
    );
  }
}
