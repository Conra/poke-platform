# Backend Agent Rules

These rules apply to `backend/`. Also follow the root `AGENTS.md`.

## Clean Architecture

```text
API / Infrastructure → Application → Domain
```

- Domain must not depend on Spring, JPA, HTTP, or PokeAPI DTOs.
- Application use cases depend on ports/interfaces.
- Infrastructure implements ports.
- Controllers remain thin.

## Clean Code

- Prefer intention-revealing names.
- Keep methods/classes focused.
- Avoid boolean-flag APIs when a clearer model exists.
- Avoid hidden side effects.
- Prefer explicit mappings at boundaries.
- Do not create generic abstractions before a second real use case exists.
- Avoid static utility dumping grounds.
- Keep error behavior explicit.

## TDD

```text
RED → GREEN → REFACTOR
```

Prioritize:
1. application use case tests
2. domain tests
3. API contract/error tests
4. adapter/integration tests where valuable

Negative cases are part of the behavior, not optional polish.

## Spring

- Keep Spring annotations at outer layers.
- Never expose JPA entities directly from controllers.
- Centralize exception mapping.
- Use Bean Validation for transport-level constraints.
- Keep business validation in domain/application where appropriate.

## Persistence

- PostgreSQL is the target relational database.
- Prefer Flyway migrations.
- Do not use automatic schema generation as the production schema strategy.
- Keep secrets/config outside source control.

## PokeAPI

- Isolate external DTOs in infrastructure.
- Configure reasonable timeouts.
- Handle not-found/upstream failures deliberately.
- Do not leak third-party response shapes into the application API.
