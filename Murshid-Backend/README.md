# Murshid Backend

Spring Boot backend for Murshid. Validates Supabase JWTs and exposes protected APIs.

## Requirements

- Java 17+
- Maven 3.9+

## Local Setup

```sh
cd Murshid-Backend
cp env.example .env
```

Fill in the values:

- `SUPABASE_PROJECT_URL` – your Supabase project URL (https://*.supabase.co)
- `FRONTEND_ORIGIN` – origin allowed via CORS (default `http://localhost:5173`)
- `SERVER_PORT` – optional custom port (default 8081)

Run the app:

```sh
mvn spring-boot:run
```

## How Supabase Is Used

- The backend validates incoming `Authorization: Bearer <token>` headers using Supabase JWT keys.
- Make sure the frontend is configured with the same Supabase project so tokens validate.

## Environment Loading

We rely on Spring's standard `.env` loading (e.g. via [dotenv-java](https://github.com/cdimascio/dotenv-java) or your shell). Ensure the environment variables are available when you run Maven.

