# Agent Orchestration

Local orchestration for isolated Codex feature agents, automated review, and explicit human approval gates.

## Behavior

For each ready task the orchestrator:

1. creates a dedicated Git branch/worktree
2. runs a Feature Agent
3. commits the resulting task changes
4. runs an independent Reviewer Agent
5. optionally sends review findings back to the Feature Agent
6. stops at `WAITING_HUMAN`

Nothing is merged automatically.

## Setup

From `automation/`:

```bash
npm install
npm run agent:validate
npm run agent:init
```

Codex must already be authenticated on the machine.

The Codex SDK uses the local Codex CLI/session.

`agent:init` is safe to rerun: if state already exists, it is left unchanged.

Commit the orchestration setup before running agents. `agent:run` refuses to
start from a dirty base working copy so generated worktrees always contain the
same tracked task specifications and prompts.

## Commands

### Validate configuration

```bash
npm run agent:validate
```

Checks task specifications, dependencies, cycle safety, concurrency settings,
and the configured base branch without starting a feature agent.

### See current state

```bash
npm run agent:status
```

### Run every currently unblocked task

```bash
npm run agent:run
```

Tasks whose dependencies are approved can run concurrently up to `max_parallel`.

### Inspect a task before approving

```bash
npm run agent:inspect -- TASK-002
```

This shows:

- branch
- worktree
- latest feature report
- reviewer report
- diff summary

Open the reported worktree in your IDE if you want to inspect the full code.

### Approve

```bash
npm run agent:approve -- TASK-002
```

Approval is the human gate.

It moves the task specification from `docs/tasks/active/` to
`docs/tasks/completed/`, updates its workflow path, and merges the task branch
into the configured base branch only after you explicitly run this command.

### Reject

```bash
npm run agent:reject -- TASK-002 "reason"
```

The task remains isolated and is not merged.

To continue work after a rejection, update the task spec or use the task worktree manually, then rerun/review as appropriate.

## States

```text
PENDING
RUNNING
REVIEWING
WAITING_HUMAN
APPROVED
REJECTED
FAILED
```

A dependent task becomes runnable only when all dependencies are `APPROVED`.

## Private root AGENTS.md

If an ignored root `AGENTS.md` exists in the main working copy, the orchestrator copies it into every generated worktree.

It remains untracked/ignored.

Tracked `backend/AGENTS.md` and `frontend/AGENTS.md` remain available normally.

## Human-in-the-loop rule

Automation may:

- generate code
- run tests
- perform review
- iterate on review findings
- commit inside the feature branch

Automation may **not**:

- approve a task
- merge into the base branch

Those actions require the repository owner.
