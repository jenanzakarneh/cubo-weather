export interface ProviderResult {
  provider: string;
  timestamp: string;
  location: {
    city?: string;
    lat: number;
    lon: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    description: string;
  };
}

export interface WeatherProvider {
  name: string;
  getByCoords(lat: number, lon: number): Promise<ProviderResult>;
  getByCity(city: string): Promise<ProviderResult>;
}
