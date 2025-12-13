import { Injectable, ServiceUnavailableException, Inject } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { ProviderResult, WeatherProvider } from './interfaces/weather-provider.interface';

export const WEATHER_PROVIDERS = 'WEATHER_PROVIDERS';

export interface ProviderManagerResult {
  result: ProviderResult;
  isFallback: boolean; // true if primary failed and a later provider was used
}

export interface ProviderManagerOptions {
  forceFailProvider?: string; // e.g. 'open-meteo' (DEV demo)
}

@Injectable()
export class ProviderManagerService {
  constructor(
    @Inject(WEATHER_PROVIDERS)
    private readonly providers: WeatherProvider[],
    private readonly loggingService: LoggingService,
  ) {}

  private async callProvider(
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

  private async maybeForceFail(
    provider: WeatherProvider,
    method: 'getByCoords' | 'getByCity',
    args: any[],
    opts?: ProviderManagerOptions,
  ) {
    if (opts?.forceFailProvider && provider.name === opts.forceFailProvider) {
      // log as provider failure even though it's forced
      await this.loggingService.logProviderCall({
        provider_name: provider.name,
        request_payload: { method, args, forced: true },
        response_payload: null,
        success: false,
        latency_ms: 0,
        error_message: `Forced failure for provider: ${provider.name}`,
      });

      throw new Error(`Forced failure for provider: ${provider.name}`);
    }
  }

  async getByCoords(
    lat: number,
    lon: number,
    opts?: ProviderManagerOptions,
  ): Promise<ProviderManagerResult> {
    if (!this.providers.length) {
      throw new ServiceUnavailableException('No weather providers configured');
    }

    let lastError: any;
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      try {
        await this.maybeForceFail(provider, 'getByCoords', [lat, lon], opts);

        const result = await this.callProvider(provider, 'getByCoords', [lat, lon]);
        return { result, isFallback: i > 0 };
      } catch (err) {
        lastError = err;
      }
    }

    throw new ServiceUnavailableException(
      `All providers failed. Last error: ${lastError?.message ?? 'unknown'}`,
    );
  }

  async getByCity(city: string, opts?: ProviderManagerOptions): Promise<ProviderManagerResult> {
    if (!this.providers.length) {
      throw new ServiceUnavailableException('No weather providers configured');
    }

    let lastError: any;
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      try {
        await this.maybeForceFail(provider, 'getByCity', [city], opts);

        const result = await this.callProvider(provider, 'getByCity', [city]);
        return { result, isFallback: i > 0 };
      } catch (err) {
        lastError = err;
      }
    }

    throw new ServiceUnavailableException(
      `All providers failed. Last error: ${lastError?.message ?? 'unknown'}`,
    );
  }
}
