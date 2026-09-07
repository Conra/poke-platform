# Product Requirements

## External Pokémon Catalog

Provide paginated browsing of Pokémon through PokeAPI. Each list item should include:
- image/sprite
- category
- weight
- abilities

## Pokémon Details

Expose:
- image
- base statistics
- description
- evolution chain

## Local Synchronization

Allow Pokémon retrieved externally to be persisted locally in a relational database so proprietary attributes can be maintained independently of PokeAPI, for example localized names, geographic metadata, or internal tags/classification.

## Local Pokémon Management

Support the required CRUD operations for locally persisted Pokémon.

Expected behavior includes:
- `400 Bad Request` for invalid/malformed requests
- `404 Not Found` for missing records
- consistent defensive error handling

## Users and Authentication

Provide:
- registration
- authentication
- public routes
- protected routes

Public external Pokémon browsing may remain public. Local data mutations should be protected.

## Data

Use a relational store with:
- a primary Pokémon-related entity
- a user entity/collection
- unique identifiers
- meaningful descriptive attributes

## Frontend

Provide a modern responsive frontend that consumes the backend and demonstrates external browsing, details, local CRUD-related flows, and authentication where needed.

## Testing

Core components require meaningful automated test coverage. TDD is the preferred development methodology.

## Delivery

Provide:
- public source repository
- README/setup documentation
- seeded/demo data or credentials
- Dockerfile
- preferably Docker Compose for simple local execution

## Optional Enhancement

Caching PokeAPI responses is useful but must not displace required functionality.

## AI-Assisted Engineering Documentation

Maintain `docs/genai.md` with a task-management CRUD API example covering prompt design, representative output, validation, corrections, edge cases, authentication, and validation considerations.

Public wording must describe this as standard engineering documentation.
