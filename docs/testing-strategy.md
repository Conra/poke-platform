# Testing Strategy

## Principle

Use TDD whenever practical:

```text
RED → GREEN → REFACTOR
```

Tests are part of feature implementation, not a cleanup phase.

## Priority

### 1. Domain Unit Tests
Fast tests without Spring context for invariants, value objects, validation rules, and domain transformations.

### 2. Application Use Case Tests
Highest priority. Test use cases against mocked/fake ports for orchestration, missing resources, invalid operations, business outcomes, and port interactions.

### 3. Adapter Tests
Use where valuable for PokeAPI mapping, JPA adapters, JWT, and persistence integration.

### 4. API Tests
Use Spring MVC tests for status codes, validation, response contracts, exception mapping, and security rules.

### 5. Integration Tests
Use Testcontainers where justified, especially for PostgreSQL migrations/persistence and critical authenticated flows.

## TDD Workflow

For each behavior:
1. Define/update the acceptance criterion.
2. Write one failing behavior test.
3. Run it and confirm RED for the expected reason.
4. Implement the minimum code required.
5. Confirm GREEN.
6. Refactor without changing behavior.
7. Run the relevant suite.
8. Repeat.

## Rules

- Do not add business behavior without a corresponding test when reasonably testable.
- Do not mock the class under test.
- Mock/fake architectural boundaries, not internal implementation details.
- Avoid tests coupled to private methods.
- Prefer behavior assertions over implementation assertions.
- Do not chase coverage percentage at the expense of useful tests.
- Negative/error cases are mandatory for relevant behavior.

## Completion Evidence

Every feature agent must report:
- tests added
- commands run
- passing/failing results
- behavior intentionally left untested and why
