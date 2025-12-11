import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeatherRequestLog } from './entities/weather-request-log.entity';
import { ProviderCallLog } from './entities/provider-call-log.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(WeatherRequestLog)
    private readonly weatherRequestRepo: Repository<WeatherRequestLog>,
    @InjectRepository(ProviderCallLog)
    private readonly providerCallRepo: Repository<ProviderCallLog>,
  ) {}

  /**
   * Create a log record for a provider call.
   */
  async logProviderCall(params: {
    provider_name: string;
    request_payload?: any;
    response_payload?: any;
    success: boolean;
    error_message?: string;
    latency_ms?: number;
    error_id?: string;
  }): Promise<ProviderCallLog> {
    const entity = this.providerCallRepo.create(params);
    return this.providerCallRepo.save(entity);
  }

  /**
   * Create a log record for the overall weather request.
   * Returns the created entity and (optionally) a new error_id if you want one.
   */
  async logWeatherRequest(params: {
    ip?: string;
    request_payload?: any;
    status: 'success' | 'fallback' | 'error';
    provider_used?: string;
    response_timestamp?: Date;
    error_id?: string;
  }): Promise<{ log: WeatherRequestLog; error_id?: string }> {
    let { error_id } = params;
    if (params.status === 'error' && !error_id) {
      error_id = uuidv4();
    }

    const entity = this.weatherRequestRepo.create({
      ...params,
      error_id,
    });

    const saved = await this.weatherRequestRepo.save(entity);
    return { log: saved, error_id };
  }
}
