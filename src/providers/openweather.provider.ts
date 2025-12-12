import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ProviderResult, WeatherProvider } from './interfaces/weather-provider.interface';

@Injectable()
export class OpenWeatherProvider implements WeatherProvider {
  public readonly name = 'openweather';

  private readonly timeoutMs = parseInt(process.env.PROVIDER_TIMEOUT_MS ?? '2500', 10);

  private get apiKey(): string {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('OPENWEATHER_API_KEY is missing');
    return key;
  }

  private ensureValid(result: ProviderResult) {
    const t = result.weather?.temperature;
    const h = result.weather?.humidity;
    if (typeof t !== 'number' || Number.isNaN(t)) throw new Error('OpenWeather invalid temperature');
    if (typeof h !== 'number' || Number.isNaN(h)) throw new Error('OpenWeather invalid humidity');
  }

  async getByCoords(lat: number, lon: number): Promise<ProviderResult> {
    const url = 'https://api.openweathermap.org/data/2.5/weather';

    const res = await axios.get(url, {
      timeout: this.timeoutMs,
      params: {
        lat,
        lon,
        appid: this.apiKey,
        units: 'metric',
      },
    });

    const data = res?.data;
    const temperature = data?.main?.temp;
    const humidity = data?.main?.humidity;
    const description = data?.weather?.[0]?.description ?? 'unknown';
    const city = data?.name;

    const result: ProviderResult = {
      provider: this.name,
      timestamp: new Date().toISOString(),
      location: { lat, lon, city },
      weather: {
        temperature: Number(temperature),
        humidity: Number(humidity),
        description: String(description),
      },
    };

    this.ensureValid(result);
    return result;
  }

  async getByCity(city: string): Promise<ProviderResult> {
    const url = 'https://api.openweathermap.org/data/2.5/weather';

    const res = await axios.get(url, {
      timeout: this.timeoutMs,
      params: {
        q: city,
        appid: this.apiKey,
        units: 'metric',
      },
    });

    const data = res?.data;
    const temperature = data?.main?.temp;
    const humidity = data?.main?.humidity;
    const description = data?.weather?.[0]?.description ?? 'unknown';
    const name = data?.name;

    const coordLat = Number(data?.coord?.lat);
    const coordLon = Number(data?.coord?.lon);

    const result: ProviderResult = {
      provider: this.name,
      timestamp: new Date().toISOString(),
      location: {
        city: name || city,
        lat: coordLat,
        lon: coordLon,
      },
      weather: {
        temperature: Number(temperature),
        humidity: Number(humidity),
        description: String(description),
      },
    };

    this.ensureValid(result);
    return result;
  }
}
