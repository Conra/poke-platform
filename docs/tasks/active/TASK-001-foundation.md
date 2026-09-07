# TASK-001 — Project Foundation

## Objective

Create the minimal stable project foundation required for independent backend and frontend feature development.

## In Scope

- Spring Boot project
- selected Java/build-tool versions
- Clean Architecture package/module skeleton
- PostgreSQL local configuration
- Flyway baseline
- Dockerfile / Docker Compose baseline
- test configuration
- global API error contract baseline
- React + TypeScript + Vite project
- frontend API configuration
- root README bootstrap instructions
- environment example files

## Out of Scope

- Pokémon catalog behavior
- Pokémon detail behavior
- local Pokémon CRUD
- authentication behavior
- caching
- visual polish
- GenAI example implementation

## Acceptance Criteria

- [ ] Backend starts locally.
- [ ] Backend tests run successfully.
- [ ] PostgreSQL starts through Docker Compose.
- [ ] Flyway runs against the configured database.
- [ ] Clean Architecture boundaries are visible.
- [ ] Frontend starts locally.
- [ ] Frontend build succeeds.
- [ ] Configuration uses environment variables, not committed secrets.
- [ ] Root docs explain basic bootstrap.
- [ ] No product feature is prematurely implemented.

## TDD / Validation

Foundation is configuration-heavy, but test the first meaningful executable behavior.

At minimum:
- Spring context/smoke test
- error contract test if error handling is introduced
- frontend baseline test only if a test runner is intentionally configured

## Definition of Done

- [ ] Backend build green
- [ ] Frontend build green
- [ ] Database bootstrap works
- [ ] No secrets committed
- [ ] Architecture documented
- [ ] Commands documented
- [ ] Changes remain foundation-only
