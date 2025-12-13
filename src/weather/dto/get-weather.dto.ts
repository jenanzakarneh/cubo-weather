// src/weather/dto/get-weather.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetWeatherDto {
  @ApiPropertyOptional({
    description:
      'DEV ONLY: Force primary provider (open-meteo) to fail to demonstrate fallback',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  forcePrimaryFail?: boolean;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 31.95,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : value))
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 35.9,
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseFloat(value) : value))
  @IsNumber()
  lon?: number;

  @ApiPropertyOptional({
    description: 'City name (alternative to lat/lon)',
    example: 'Amman',
  })
  @IsOptional()
  @IsString()
  city?: string;
}
