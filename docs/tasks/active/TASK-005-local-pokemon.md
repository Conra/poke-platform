# TASK-005 — Local Pokémon Persistence and CRUD

## Objective

Persist Pokémon locally and support management of proprietary/local attributes.

## Dependencies

- TASK-001
- established external Pokémon port/model from TASK-002 or TASK-003
- TASK-004 for protected mutations

## In Scope

- relational local Pokémon model
- Flyway migration
- synchronization from external data
- list/read local records
- update local attributes
- delete local records
- required CRUD semantics
- validation
- `400` / `404` behavior
- protected mutations
- tests

## Out of Scope

- advanced search
- audit history
- complex ownership model
- caching

## Acceptance Criteria

- [ ] Pokémon can be synchronized locally.
- [ ] Duplicate synchronization has defined behavior.
- [ ] Local records can be listed/read.
- [ ] Proprietary attributes can be updated.
- [ ] Local records can be deleted.
- [ ] Missing local Pokémon returns `404`.
- [ ] Invalid updates return `400`.
- [ ] Mutations require authentication.
- [ ] Persistence is tested against PostgreSQL where practical.

## TDD Plan

1. synchronize use case
2. duplicate behavior
3. retrieve/list
4. update validation
5. not-found update
6. delete/not-found delete
7. API contracts
8. JPA adapter integration
9. security behavior
