// src/weather/weather.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service';
import { GetWeatherDto } from './dto/get-weather.dto';

@Injectable()
export class WeatherService {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Validates the query according to the task:
   * - Either (lat AND lon) OR (city)
   * - Not both, not none
   */
  private validateQuery(query: GetWeatherDto) {
    const hasCoords = query.lat !== undefined || query.lon !== undefined;
    const hasBothCoords = query.lat !== undefined && query.lon !== undefined;
    const hasCity = !!query.city;

    if ((hasCoords && hasCity) || (!hasBothCoords && !hasCity)) {
      throw new BadRequestException(
        'Provide either both lat & lon or city, but not both and not incomplete coordinates.',
      );
    }
  }

  /**
   * For now, this uses a mock provider response.
   * Later we will delegate to ProviderManager & external APIs.
   */
  async getWeather(query: GetWeatherDto, ip?: string) {
    this.validateQuery(query);

    // 🔹 Mock "provider" result (we'll replace this with real provider calls)
    const now = new Date();
    const providerName = 'mock-provider';

    const response = {
      provider: providerName,
      timestamp: now.toISOString(),
      location: {
        city: query.city ?? 'Mock City',
        lat: query.lat ?? 31.95,
        lon: query.lon ?? 35.9,
      },
      weather: {
        temperature: 25.3,
        humidity: 60,
        description: 'clear sky (mock)',
      },
    };

    // 🔹 Log the overall request
    await this.loggingService.logWeatherRequest({
      ip,
      request_payload: query,
      status: 'success',
      provider_used: providerName,
      response_timestamp: now,
    });

    // In future steps, we will also log each provider call via logProviderCall()

    return response;
  }
}
