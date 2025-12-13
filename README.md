## Features
- Multi-provider weather retrieval with fallback
- Rate limiting per IP
- In-memory caching
- Structured logging to PostgreSQL
- Swagger API documentation

## Providers
1. Open-Meteo (primary)
2. OpenWeather (fallback)

## Fallback Strategy
- Providers are tried sequentially
- Any provider returning invalid or missing data is considered failed
- If primary fails, secondary is used automatically
- If all fail, API returns 503 with error_id

## Demo Fallback
Use:
GET /api/weather?city=Amman&forcePrimaryFail=true

This forces the primary provider to fail and demonstrates fallback.

## Logging
- provider_call_logs: logs every provider attempt
- weather_request_logs: logs overall request outcome
