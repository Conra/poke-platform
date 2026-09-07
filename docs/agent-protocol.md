# Agent Development Protocol

## Objective

Allow multiple agents to work in parallel while keeping changes small, isolated, reviewable, and easy to explain.

## Core Model

```text
Requirement
   ↓
Task Specification
   ↓
Dedicated Branch / Worktree
   ↓
Feature Agent
   ↓
Automated Tests
   ↓
Reviewer Agent
   ↓
Human Review
   ↓
Integration
```

## 1. Task Creation

Every implementation starts from a task under `docs/tasks/active/` defining objective, acceptance criteria, scope, out-of-scope items, dependencies, test expectations, and validation commands.

No coding agent should start from a vague paragraph.

## 2. Isolation

Each feature gets one task ID, one branch, and one worktree/thread.

Example:

```text
TASK-002
branch: feat/task-002-pokemon-catalog
```

Agents should not share the same working directory.

## 3. Parallelization Rule

Tasks may run in parallel only when:
- dependencies are satisfied
- expected write sets are mostly independent
- they do not require incompatible schema/API decisions

Shared foundations must be stabilized first.

## 4. TDD Requirement

Feature agents must follow `docs/testing-strategy.md`.

```text
test first → minimum implementation → refactor
```

## 5. Change Scope

Agents may modify files required by the task, add tests, and make small supporting refactors.

Agents must not implement unrelated features, redesign architecture silently, change unrelated public contracts, or rewrite large working areas for style reasons.

## 6. Completion Report

Every feature agent reports:

```text
Task:
Status:

Implemented:
- ...

TDD evidence:
- RED: ...
- GREEN: ...
- REFACTOR: ...

Tests added:
- ...

Commands executed:
- ...

Architecture / decisions:
- ...

Files changed:
- ...

Risks / follow-ups:
- ...
```

## 7. Review

Review order:
1. acceptance criteria
2. correctness
3. Clean Architecture boundaries
4. TDD/test quality
5. error handling
6. security
7. unnecessary complexity
8. readability

## 8. Human Gate

Do not integrate until the repository owner can understand what changed, main architectural choices, tests, and relevant tradeoffs.

## 9. Integration

After approved changes are combined, run complete backend tests, frontend checks/build/tests, migrations, Docker validation, and cross-feature contract checks.

## 10. Task Lifecycle

Move completed tasks from:

```text
docs/tasks/active/TASK-XXX.md
```

to:

```text
docs/tasks/completed/TASK-XXX.md
```
