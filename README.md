# Cubo Weather API

This project is a NestJS-based Weather API that retrieves current weather data from multiple external providers with automatic fallback, caching, rate limiting, and structured logging.

The focus of this implementation is **reliability**, **observability**, and **clear failure handling**, rather than UI or authentication features.

---

## What’s implemented

* Weather endpoint supporting:

  * lookup by **city**
  * lookup by **latitude & longitude**
* Multiple weather providers with fallback:

  * Primary provider: Open-Meteo
  * Secondary provider: OpenWeather
* Automatic fallback when a provider fails or returns invalid data
* In-memory caching with configurable TTL
* Rate limiting per IP
* Structured logging to PostgreSQL
* Swagger documentation
* Fully Dockerized setup (API + database)

---

## Provider strategy

Providers are queried sequentially.

1. The primary provider is called first.
2. If it fails (timeout, error, or invalid response), the next provider is tried.
3. Every provider attempt is logged.
4. If all providers fail, the API returns `503 Service Unavailable` with a generated `error_id`.

This approach allows the system to remain functional even when external services are unreliable.

---

## Fallback demonstration

For demonstration purposes, fallback behavior can be triggered manually via a query parameter:

```
GET /api/weather?city=Amman&forcePrimaryFail=true
```

When enabled, the primary provider is forced to fail, allowing fallback behavior to be observed directly through Swagger and database logs.

This behavior is controlled by the `ENABLE_FALLBACK_DEMO` environment variable.

---

## Logging

Two database tables are used for observability:

### `provider_call_logs`

Stores a record for **every provider attempt**, including:

* provider name
* success or failure
* latency
* error message (if any)

### `weather_request_logs`

Stores one record per API request, including:

* final status (`success`, `fallback`, `error`)
* provider used
* timestamp
* `error_id` (when applicable)

This makes it easy to trace failures and understand runtime behavior.

---

## Running the project

### Prerequisites

* Docker
* Docker Compose
* Git

No local Node.js installation is required.

---

### Steps

```bash
git clone <repository-url>
cd cubo-weather

cp .env.example .env
# optionally update OPENWEATHER_API_KEY inside .env

docker compose up --build
```

---

### Access

* API:
  [http://localhost:3000](http://localhost:3000)

* Swagger documentation:
  [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Example requests

Get weather by city:

```
GET /api/weather?city=Amman
```

Get weather by coordinates:

```
GET /api/weather?lat=31.95&lon=35.9
```

Force fallback (demo):

```
GET /api/weather?city=Amman&forcePrimaryFail=true
```

---

## Environment configuration

All configuration is done via environment variables.

A documented `.env.example` file is provided and should be copied to `.env` before running the project.

Important variables include:

* `DATABASE_URL`
* `OPENWEATHER_API_KEY`
* `RATE_LIMIT_TTL`
* `CACHE_TTL_SECONDS`
* `PROVIDER_TIMEOUT_MS`

---

## Notes

* Authorization was intentionally left out, as they were not core requirements for this task.
* The codebase is structured to allow additional providers or auth layers to be added later without major refactoring.


