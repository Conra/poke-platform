# TASK-XXX — Short Task Name

## Objective

One sentence describing the observable outcome.

## User / Product Value

Why this behavior exists.

## Scope

### In Scope

- ...

### Out of Scope

- ...

## Acceptance Criteria

- [ ] Given ..., when ..., then ...
- [ ] Invalid input returns ...
- [ ] Missing resources return ...

## Architectural Boundaries

Expected layers touched:

- [ ] Domain
- [ ] Application
- [ ] API
- [ ] Infrastructure
- [ ] Frontend
- [ ] Database migration

## Expected Write Set

```text
backend/...
frontend/...
docs/...
```

## Dependencies

- TASK-...

or:

- None

## TDD Plan

### Behavior 1

1. RED: test ...
2. GREEN: minimum implementation ...
3. REFACTOR: ...

## Required Tests

- [ ] domain tests
- [ ] use case tests
- [ ] API tests
- [ ] adapter tests where needed
- [ ] integration test where justified

## Documentation Impact

Review whether this task changes:

- [ ] README/setup
- [ ] architecture
- [ ] API contract
- [ ] environment variables
- [ ] migrations/database
- [ ] authentication/demo credentials
- [ ] Docker behavior
- [ ] ADR required

Document the outcome even if no updates are required.

## Validation Commands

```bash
./mvnw test
npm run build
```

Adjust to actual tooling.

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Relevant tests written and passing
- [ ] Clean Architecture dependency direction preserved
- [ ] Error handling implemented
- [ ] Documentation impact reviewed
- [ ] Required documentation updated
- [ ] No unrelated scope added
- [ ] Build passes
- [ ] Completion report produced
