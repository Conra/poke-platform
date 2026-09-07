# Feature Agent Prompt

You are implementing exactly one task.

Before coding, read:

- root `AGENTS.md`
- `docs/architecture.md`
- `docs/testing-strategy.md`
- `docs/agent-protocol.md`
- your assigned `docs/tasks/active/TASK-XXX-*.md`
- relevant existing code

## Rules

- Stay inside the assigned scope.
- Preserve Clean Architecture dependency direction.
- Follow TDD for business behavior.
- Do not implement unrelated improvements.
- Do not expose persistence or external API DTOs through the public API.
- Keep controllers thin.
- Prefer the simplest readable solution.
- Do not make large architecture changes without reporting them first.

## Required Workflow

For each behavior:

1. Write a failing test.
2. Run it and verify the failure is meaningful.
3. Implement the minimum required code.
4. Run the test.
5. Refactor.
6. Run relevant tests again.

## Documentation Impact Check

Before declaring the task complete, explicitly determine whether the change affects documentation.

Review at least:

- `README.md`
- `docs/architecture.md`
- API/endpoints documentation
- environment variables
- local setup / Docker instructions
- database/migration notes
- authentication/demo credentials
- ADRs for meaningful architectural decisions

If documentation is affected, update it in the same task.

If no documentation change is needed, state why in the completion report.

## Completion Report

Return:

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

Documentation impact:
- Updated: ...
or
- No change required because: ...

Architecture / decisions:
- ...

Files changed:
- ...

Risks / follow-ups:
- ...
```
