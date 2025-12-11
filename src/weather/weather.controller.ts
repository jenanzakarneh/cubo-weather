// src/weather/weather.controller.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import express from 'express';
import { WeatherService } from './weather.service';
import { GetWeatherDto } from './dto/get-weather.dto';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current weather',
    description:
      'Returns current weather for a location. You must provide either (lat & lon) or (city), but not both.',
  })
  @ApiOkResponse({
    description: 'Current weather data',
    schema: {
      example: {
        provider: 'mock-provider',
        timestamp: '2025-12-11T12:34:56.000Z',
        location: {
          city: 'Amman',
          lat: 31.95,
          lon: 35.9,
        },
        weather: {
          temperature: 25.3,
          humidity: 60,
          description: 'clear sky',
        },
      },
    },
  })
    @ApiTooManyRequestsResponse({
    description: 'Too many requests from this IP. Try again later.',
  })
  async getWeather(@Query() query: GetWeatherDto, @Req() req: express.Request) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      undefined;

    return this.weatherService.getWeather(query, ip);
  }
}
