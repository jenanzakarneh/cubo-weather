import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ProviderResult, WeatherProvider } from './interfaces/weather-provider.interface';

@Injectable()
export class OpenMeteoProvider implements WeatherProvider {
  public readonly name = 'open-meteo';

  private readonly timeoutMs = parseInt(process.env.PROVIDER_TIMEOUT_MS ?? '2500', 10);

  private weatherCodeToText(code: number | null | undefined): string {
    const c = Number(code);
    if (Number.isNaN(c)) return 'unknown';

    // Minimal mapping (enough for task)
    if (c === 0) return 'clear sky';
    if ([1, 2, 3].includes(c)) return 'partly cloudy';
    if ([45, 48].includes(c)) return 'fog';
    if ([51, 53, 55].includes(c)) return 'drizzle';
    if ([61, 63, 65].includes(c)) return 'rain';
    if ([71, 73, 75].includes(c)) return 'snow';
    if ([80, 81, 82].includes(c)) return 'rain showers';
    if ([95, 96, 99].includes(c)) return 'thunderstorm';
    return 'unknown';
  }

  private ensureValid(result: ProviderResult) {
    const t = result.weather?.temperature;
    const h = result.weather?.humidity;
    const lat = result.location?.lat;
    const lon = result.location?.lon;

    if (typeof t !== 'number' || Number.isNaN(t)) throw new Error('OpenMeteo invalid temperature');
    if (typeof h !== 'number' || Number.isNaN(h)) throw new Error('OpenMeteo invalid humidity');
    if (typeof lat !== 'number' || typeof lon !== 'number') throw new Error('OpenMeteo invalid coords');
  }

  async getByCoords(lat: number, lon: number): Promise<ProviderResult> {
    const url = 'https://api.open-meteo.com/v1/forecast';

    const res = await axios.get(url, {
      timeout: this.timeoutMs,
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,weather_code',
        timezone: 'auto',
      },
    });

    const current = res?.data?.current;
    const temperature = current?.temperature_2m;
    const humidity = current?.relative_humidity_2m;
    const code = current?.weather_code;

    const result: ProviderResult = {
      provider: this.name,
      timestamp: new Date().toISOString(),
      location: { lat, lon },
      weather: {
        temperature: Number(temperature),
        humidity: Number(humidity),
        description: this.weatherCodeToText(code),
      },
    };

    this.ensureValid(result);
    return result;
  }

  async getByCity(city: string): Promise<ProviderResult> {
    // Geocoding first
    const geoUrl = 'https://geocoding-api.open-meteo.com/v1/search';

    const geo = await axios.get(geoUrl, {
      timeout: this.timeoutMs,
      params: {
        name: city,
        count: 1,
        language: 'en',
        format: 'json',
      },
    });

    const first = geo?.data?.results?.[0];
    if (!first?.latitude || !first?.longitude) {
      throw new Error(`OpenMeteo geocoding failed for city: ${city}`);
    }

    const lat = Number(first.latitude);
    const lon = Number(first.longitude);
    const resolvedName =
      [first.name, first.admin1, first.country].filter(Boolean).join(', ') || city;

    const base = await this.getByCoords(lat, lon);
    return {
      ...base,
      location: {
        ...base.location,
        city: resolvedName,
      },
    };
  }
}
