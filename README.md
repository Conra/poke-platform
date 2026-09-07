# Poké Platform

Poké Platform is a full-stack application for browsing Pokémon data from
PokeAPI and managing selected records locally. This repository currently
provides the stable backend, frontend, database, and container foundation on
which those product features are built.

## Technology stack

- Java 21, Spring Boot 3.5, Maven
- Spring Web, Bean Validation, Spring Data JPA
- PostgreSQL 17 and Flyway
- React 19, TypeScript 7, Vite 8
- Docker Compose

## Repository layout

```text
backend/   Spring Boot API
frontend/  React single-page application
docs/      Architecture, testing, and engineering documentation
```

The backend follows Clean Architecture. Dependencies point inward from API and
infrastructure to application and domain code; the domain remains independent
of Spring, HTTP, persistence, and external services.

## Prerequisites

For the container workflow, install Docker with Compose. For local development,
install Java 21, Maven 3.6.3 or newer, Node.js 24, npm, and Docker for
PostgreSQL.

## Run everything with Docker

Create a local environment file and replace the example password:

```bash
cp .env.example .env
docker compose up --build
```

The frontend is available at `http://localhost:5173` and the backend at
`http://localhost:8080`. PostgreSQL is exposed on port `5432` for local tools.
Use `docker compose down` to stop the stack. The named database volume is
preserved between runs.

## Run locally

Start only PostgreSQL from the repository root:

```bash
cp .env.example .env
docker compose up database
```

In another shell, start the backend after setting the database password to the
same value used in `.env`:

```bash
cd backend
export DATABASE_PASSWORD=replace-with-local-password
mvn spring-boot:run
```

On PowerShell, set it with
`$env:DATABASE_PASSWORD = "replace-with-local-password"`.

Start the frontend in a third shell:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server proxies `/api` requests to
`http://localhost:8080`. Copy `frontend/.env.example` to `frontend/.env` only
when those defaults need to be changed.

## Configuration

No operational secrets are committed. `.env` files are ignored; the committed
`.env.example` files contain names and replaceable local values only.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `POSTGRES_DB` | Compose | PostgreSQL database name |
| `POSTGRES_USER` | Compose | PostgreSQL user |
| `POSTGRES_PASSWORD` | Compose | Required local database password |
| `DATABASE_URL` | Backend | JDBC URL; defaults to local PostgreSQL |
| `DATABASE_USERNAME` | Backend | Database user; defaults to `poke_platform` |
| `DATABASE_PASSWORD` | Backend | Required database password |
| `SERVER_PORT` | Backend | HTTP port; defaults to `8080` |
| `VITE_API_BASE_URL` | Frontend | Browser-visible API base path |
| `VITE_DEV_PROXY_TARGET` | Frontend | Vite development proxy target |

## Database migrations

Flyway owns schema evolution and runs automatically when the backend starts.
`V1__baseline.sql` establishes migration history without creating future
product tables. Hibernate validates the migrated schema and does not generate
it.

## Validation

Run backend tests:

```bash
cd backend
mvn test
```

Run the frontend type check and production build:

```bash
cd frontend
npm ci
npm run build
```

Validate the resolved Compose model after creating `.env`:

```bash
docker compose config
```

## API baseline

Product endpoints are intentionally added by later features. API errors use a
shared contract from the start. For example, an unknown route returns:

```json
{
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Resource was not found",
  "timestamp": "2026-01-01T00:00:00Z",
  "path": "/api/missing"
}
```

See [docs/architecture.md](docs/architecture.md) and
[docs/testing-strategy.md](docs/testing-strategy.md) for the project rules.
