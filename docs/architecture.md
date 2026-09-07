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
