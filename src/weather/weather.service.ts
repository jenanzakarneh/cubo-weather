import { Injectable, BadRequestException, ServiceUnavailableException, Inject } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { GetWeatherDto } from './dto/get-weather.dto';
import { ProviderManagerService } from '../providers/provider-manager.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
@Injectable()
export class WeatherService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly providerManager: ProviderManagerService,
    @Inject(CACHE_MANAGER) private readonly cache: cacheManager.Cache,

  ) {}

  /**
   * Validates the query according to the task:
   * - Either (lat AND lon) OR (city)
   * - Not both, not none
   */
  private validateQuery(query: GetWeatherDto) {
    const hasAnyCoords = query.lat !== undefined || query.lon !== undefined;
    const hasBothCoords = query.lat !== undefined && query.lon !== undefined;
    const hasCity = !!query.city;

    if ((hasAnyCoords && hasCity) || (!hasBothCoords && !hasCity)) {
      throw new BadRequestException(
        'Provide either both lat & lon or city, but not both and not incomplete coordinates.',
      );
    }
  }

  async getWeather(query: GetWeatherDto, ip?: string) {
  this.validateQuery(query);

  // ---- 1️⃣ Generate cache key
  const cacheKey = query.city
    ? `weather:city:${query.city.toLowerCase()}`
    : `weather:coords:${query.lat},${query.lon}`;

  // ---- 2️⃣ Check cache
  const cached = await this.cache.get<any>(cacheKey);
  if (cached) {
    // Log a cached request
    await this.loggingService.logWeatherRequest({
      ip,
      request_payload: query,
      status: 'success',
      provider_used: cached.provider,
      response_timestamp: new Date(cached.timestamp),
    });

    return {
      ...cached,
      cached: true, // optional — helpful for debugging
    };
  }

  // ---- 3️⃣ Not cached → call providers
  try {
    let providerResult;
    let isFallback = false;

    if (query.city) {
      const r = await this.providerManager.getByCity(query.city);
      providerResult = r.result;
      isFallback = r.isFallback;
    } else {
      const r = await this.providerManager.getByCoords(query.lat!, query.lon!);
      providerResult = r.result;
      isFallback = r.isFallback;
    }

    // ---- 4️⃣ Save to cache
    await this.cache.set(cacheKey, providerResult);

    // ---- 5️⃣ Log success or fallback
    await this.loggingService.logWeatherRequest({
      ip,
      request_payload: query,
      status: isFallback ? 'fallback' : 'success',
      provider_used: providerResult.provider,
      response_timestamp: new Date(providerResult.timestamp),
    });

    return providerResult;

  } catch (error) {
    // ---- 6️⃣ Log provider failure
    const { error_id } = await this.loggingService.logWeatherRequest({
      ip,
      request_payload: query,
      status: 'error',
    });

    throw new ServiceUnavailableException({
      statusCode: 503,
      message: 'Service temporarily unavailable',
      error_id,
    });
  }
}

}
