# TASK-004 — Authentication

## Objective

Provide minimal complete registration and authentication with public and protected routes.

## Dependencies

- TASK-001

## In Scope

- user persistence
- registration
- password hashing
- login
- JWT issuance/validation
- public/protected route configuration
- demo user/credentials if appropriate
- tests

## Out of Scope

- complex roles/permissions
- OAuth
- refresh-token architecture unless clearly necessary
- social login

## Acceptance Criteria

- [ ] User can register with valid input.
- [ ] Duplicate/invalid registration is rejected consistently.
- [ ] Passwords are never persisted in plaintext.
- [ ] Valid credentials return an authentication token.
- [ ] Invalid credentials are rejected.
- [ ] Public Pokémon reads remain accessible.
- [ ] Protected mutation behavior is demonstrated by tests.
- [ ] Security behavior is covered by tests.

## TDD Plan

1. registration validation
2. duplicate user behavior
3. password hashing
4. authentication success/failure
5. JWT validation
6. route protection
