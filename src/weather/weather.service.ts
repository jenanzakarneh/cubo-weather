import { Injectable, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { GetWeatherDto } from './dto/get-weather.dto';
import { ProviderManagerService } from '../providers/provider-manager.service';

@Injectable()
export class WeatherService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly providerManager: ProviderManagerService,
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

    const hasCity = !!query.city;

    try {
      let providerResult;
      let isFallback = false;

      if (hasCity) {
        const r = await this.providerManager.getByCity(query.city!);
        providerResult = r.result;
        isFallback = r.isFallback;
      } else {
        const r = await this.providerManager.getByCoords(query.lat!, query.lon!);
        providerResult = r.result;
        isFallback = r.isFallback;
      }

      // Log overall request as success or fallback
      await this.loggingService.logWeatherRequest({
        ip,
        request_payload: query,
        status: isFallback ? 'fallback' : 'success',
        provider_used: providerResult.provider,
        response_timestamp: new Date(providerResult.timestamp),
      });

      // Return provider result directly
      return providerResult;
    } catch (error) {
      // If all providers failed, we log an error request with an error_id
      const { error_id } = await this.loggingService.logWeatherRequest({
        ip,
        request_payload: query,
        status: 'error',
        provider_used: undefined,
        response_timestamp: undefined,
      });

      // Return 503 with error id
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'Service temporarily unavailable',
        error_id,
      });
    }
  }
}
