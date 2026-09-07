# TASK-002 — Pokémon Catalog

## Objective

Expose a paginated external Pokémon catalog through the backend API.

## Dependencies

- TASK-001

## In Scope

- paginated endpoint
- PokeAPI integration needed for catalog data
- identifier/name
- sprite/image
- category
- weight
- abilities
- upstream DTO mapping
- upstream failure handling
- backend tests

## Out of Scope

- details/evolution chain
- local persistence
- authentication
- caching
- frontend

## Acceptance Criteria

- [ ] Client can request a Pokémon page.
- [ ] Pagination is consistent.
- [ ] Every item contains required catalog attributes.
- [ ] Raw PokeAPI payloads are not exposed.
- [ ] Invalid pagination returns `400`.
- [ ] Relevant PokeAPI failures map to the application error contract.
- [ ] Core behavior is covered by tests.

## TDD Plan

1. RED/GREEN/REFACTOR pagination validation.
2. RED/GREEN/REFACTOR application catalog use case using a fake/mock external port.
3. RED/GREEN/REFACTOR API contract.
4. RED/GREEN/REFACTOR PokeAPI mapping and error behavior.

## Required Tests

- [ ] application use case
- [ ] input validation
- [ ] API response/status
- [ ] PokeAPI mapping
- [ ] upstream failure mapping
