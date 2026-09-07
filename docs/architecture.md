# Architecture

## Goal

Build `poke-platform` using Clean Architecture so business rules remain independent from frameworks, persistence, HTTP, and PokeAPI.

## Dependency Rule

```text
API / Infrastructure
        ↓
Application
        ↓
Domain
```

The Domain layer must not depend on Spring, JPA, HTTP, external API DTOs, or database implementations.

## Backend Layers

### Domain
Owns business concepts and rules. Framework annotations should not be required by domain classes.

### Application
Owns use cases and ports. Application code depends on interfaces, not infrastructure implementations.

Expected use cases include:
- `ListPokemon`
- `GetPokemonDetails`
- `SynchronizePokemon`
- `ListLocalPokemon`
- `UpdateLocalPokemon`
- `DeleteLocalPokemon`
- `RegisterUser`
- `AuthenticateUser`

### API
Owns HTTP concerns only: controllers, request/response DTOs, validation, exception-to-HTTP mapping, authentication entry points.

Controllers must remain thin.

### Infrastructure
Owns technical implementations: PokeAPI client, JPA/PostgreSQL adapters, JWT, caching, Spring configuration, Flyway migrations.

## Boundary Rules

- Do not expose JPA entities from controllers.
- Do not expose PokeAPI DTOs from controllers.
- Do not put business logic in controllers.
- Do not make application use cases depend on Spring MVC or JPA.
- Map external/persistence models at architectural boundaries.

## Frontend

Prefer feature-oriented organization:

```text
frontend/src/
├── app/
├── features/
│   ├── auth/
│   ├── pokemon-catalog/
│   ├── pokemon-details/
│   └── local-pokemon/
├── shared/
│   ├── api/
│   ├── components/
│   └── types/
└── main.tsx
```

## Architecture Rule

A new abstraction must solve a current problem. Do not add abstractions only because they may be useful later.

## Foundation Decisions

### Runtime and build

- Java 21 and Spring Boot 3.5 provide a stable Jakarta-based backend baseline.
- Maven owns dependency management and produces one executable backend JAR.
- React, TypeScript, and Vite provide a small typed frontend without introducing
  global state management before product behavior requires it.
- PostgreSQL is the production database. H2 is used only by the backend smoke
  test so the test suite stays fast and self-contained.

### Backend package boundaries

```text
com.pokeplatform
├── api
├── application
│   └── port
│       ├── in
│       └── out
├── domain
└── infrastructure
```

The package skeleton is deliberately empty of product concepts. Future feature
work adds domain models and use cases only when their behavior is implemented.
Package documentation makes the intended dependency direction visible without
introducing speculative interfaces.

### Persistence ownership

Flyway is the only production schema-generation mechanism. Hibernate uses
`ddl-auto=validate`, which catches mapping/migration drift without mutating the
schema. The initial migration records the baseline and intentionally contains no
product tables.

### Frontend-to-backend routing

Frontend code uses the relative `/api` base path by default. Vite proxies that
path to the local backend during development, and Nginx proxies it to the
backend service in Docker. This keeps browser code environment-neutral and
avoids a foundation-level CORS policy that could conflict with later security
work.

### Error contract

The API layer owns the shared error response because status codes and request
paths are transport concerns. The baseline advice maps unknown routes to the
contract. Feature-specific exceptions will be mapped here as their use cases are
introduced; domain and application layers will not depend on HTTP types.
