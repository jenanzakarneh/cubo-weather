import { Injectable } from '@nestjs/common';
import { ProviderResult, WeatherProvider } from '../interfaces/weather-provider.interface';

@Injectable()
export class MockProvider implements WeatherProvider {
  public readonly name = 'mock-provider';

  async getByCoords(lat: number, lon: number): Promise<ProviderResult> {
    const now = new Date();

    return {
      provider: this.name,
      timestamp: now.toISOString(),
      location: {
        lat,
        lon,
      },
      weather: {
        temperature: 24.5,
        humidity: 55,
        description: 'clear sky (mock by coords)',
      },
    };
  }

  async getByCity(city: string): Promise<ProviderResult> {
    const now = new Date();

    return {
      provider: this.name,
      timestamp: now.toISOString(),
      location: {
        city,
        lat: 31.95,
        lon: 35.9,
      },
      weather: {
        temperature: 25.3,
        humidity: 60,
        description: `clear sky in ${city} (mock)`,
      },
    };
  }
}
