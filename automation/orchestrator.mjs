import { Codex } from "@openai/codex-sdk";
import YAML from "yaml";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  renameSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const workflowPath = path.join(here, "workflow.yaml");
const stateDir = path.join(here, ".state");
const statePath = path.join(stateDir, "state.json");
const reportDir = path.join(stateDir, "reports");

const workflow = YAML.parse(readFileSync(workflowPath, "utf8"));
const settings = workflow.settings ?? {};
const tasks = workflow.tasks ?? {};

const MAX_PARALLEL = settings.max_parallel ?? 3;
const MAX_REVIEW_ROUNDS = settings.max_review_rounds ?? 1;
const BASE_BRANCH = settings.base_branch ?? "main";
const REASONING = settings.reasoning_effort ?? "high";
const WORKTREE_ROOT = path.resolve(repoRoot, settings.worktree_root ?? "../agent-worktrees");

const featureSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["DONE", "BLOCKED"] },
    summary: { type: "string" },
    implemented: { type: "array", items: { type: "string" } },
    tdd_evidence: { type: "array", items: { type: "string" } },
    tests: { type: "array", items: { type: "string" } },
    commands: { type: "array", items: { type: "string" } },
    documentation_impact: { type: "array", items: { type: "string" } },
    decisions: { type: "array", items: { type: "string" } },
    files_changed: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } }
  },
  required: [
    "status",
    "summary",
    "implemented",
    "tdd_evidence",
    "tests",
    "commands",
    "documentation_impact",
    "decisions",
    "files_changed",
    "risks"
  ],
  additionalProperties: false
};

const reviewSchema = {
  type: "object",
  properties: {
    review: { type: "string", enum: ["PASS", "CHANGES_REQUIRED"] },
    summary: { type: "string" },
    critical: { type: "array", items: { type: "string" } },
    important: { type: "array", items: { type: "string" } },
    minor: { type: "array", items: { type: "string" } },
    architecture: { type: "array", items: { type: "string" } },
    testing: { type: "array", items: { type: "string" } },
    documentation: { type: "array", items: { type: "string" } },
    acceptance_criteria: { type: "array", items: { type: "string" } },
    recommended_fixes: { type: "array", items: { type: "string" } }
  },
  required: [
    "review",
    "summary",
    "critical",
    "important",
    "minor",
    "architecture",
    "testing",
    "documentation",
    "acceptance_criteria",
    "recommended_fixes"
  ],
  additionalProperties: false
};

function sh(args, cwd = repoRoot, options = {}) {
  return execFileSync(args[0], args.slice(1), {
    cwd,
    encoding: "utf8",
    stdio: options.inherit ? "inherit" : "pipe",
  }).trim();
}

function ensureDirs() {
  mkdirSync(stateDir, { recursive: true });
  mkdirSync(reportDir, { recursive: true });
}

function initialState() {
  return {
    version: 1,
    tasks: Object.fromEntries(
      Object.keys(tasks).map(id => [
        id,
        {
          status: "PENDING",
          branch: null,
          worktree: null,
          feature_thread_id: null,
          review_thread_ids: [],
          review_round: 0,
          last_error: null,
          rejection_reason: null
        }
      ])
    )
  };
}

function loadState() {
  ensureDirs();
  if (!existsSync(statePath)) {
    const state = initialState();
    saveState(state);
    return state;
  }
  return JSON.parse(readFileSync(statePath, "utf8"));
}

function saveState(state) {
  ensureDirs();
  writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
}

function taskSlug(id) {
  const name = tasks[id].name ?? id;
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function branchFor(id) {
  return `feat/${id.toLowerCase()}-${taskSlug(id)}`;
}

function worktreeFor(id) {
  return path.join(WORKTREE_ROOT, id.toLowerCase());
}

function gitBranchExists(branch) {
  try {
    sh(["git", "show-ref", "--verify", "--quiet", `refs/heads/${branch}`]);
    return true;
  } catch {
    return false;
  }
}

function ensureWorktree(id, state) {
  const branch = state.tasks[id].branch ?? branchFor(id);
  const worktree = state.tasks[id].worktree ?? worktreeFor(id);

  if (!existsSync(worktree)) {
    mkdirSync(WORKTREE_ROOT, { recursive: true });
    mkdirSync(path.dirname(worktree), { recursive: true });

    if (gitBranchExists(branch)) {
      sh(["git", "worktree", "add", worktree, branch]);
    } else {
      sh(["git", "worktree", "add", "-b", branch, worktree, BASE_BRANCH]);
    }
  }

  // Root AGENTS.md can remain private/untracked.
  const privateAgents = path.join(repoRoot, "AGENTS.md");
  const targetAgents = path.join(worktree, "AGENTS.md");
  if (existsSync(privateAgents) && !existsSync(targetAgents)) {
    copyFileSync(privateAgents, targetAgents);
  }

  state.tasks[id].branch = branch;
  state.tasks[id].worktree = worktree;
  saveState(state);

  return { branch, worktree };
}

function readText(rel, base = repoRoot) {
  return readFileSync(path.join(base, rel), "utf8");
}

function featurePrompt(id) {
  return `
You are the Feature Agent for ${id}.

Read and obey, in this order:
- AGENTS.md if present
- docs/architecture.md
- docs/testing-strategy.md
- docs/agent-protocol.md
- backend/AGENTS.md when working in backend/
- frontend/AGENTS.md when working in frontend/
- ${tasks[id].spec}
- docs/prompts/feature-agent.md

Implement exactly ${id}.

Important:
- Follow Clean Architecture.
- Follow Clean Code.
- Use TDD for business behavior: RED -> GREEN -> REFACTOR.
- Keep scope limited to the assigned task.
- Run all relevant validation commands.
- Do not implement unrelated future tasks.
- Leave the worktree in a buildable state.
- Do not merge branches.
- Do not modify Git history outside your task branch.

At the end return the requested structured completion report.
`.trim();
}

function reviewerPrompt(id) {
  return `
You are the independent Reviewer Agent for ${id}.

Read:
- AGENTS.md if present
- docs/architecture.md
- docs/testing-strategy.md
- docs/agent-protocol.md
- ${tasks[id].spec}
- docs/prompts/reviewer.md

Review the actual implementation in this worktree.

Inspect the diff against ${BASE_BRANCH} and run relevant tests/checks when possible.

Review priorities:
1. acceptance criteria
2. correctness
3. Clean Architecture dependency direction
4. TDD and behavior-focused test quality
5. error handling
6. security
7. unnecessary complexity
8. readability/regression risk

Do not change files. Return only the structured review.
`.trim();
}

function correctionPrompt(id, review) {
  return `
The independent reviewer returned CHANGES_REQUIRED for ${id}.

Review:
${JSON.stringify(review, null, 2)}

Fix only the issues required to make ${id} correct and compliant.

Keep the original task scope.
Preserve Clean Architecture and TDD.
Add or improve tests before/with implementation changes where appropriate.
Run relevant validation commands.

Do not merge branches.

Return the same structured feature completion report.
`.trim();
}

function parseStructured(response, label) {
  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error(`${label} did not return valid structured JSON`);
  }
}

function writeReport(id, kind, value, round = null) {
  const suffix = round === null ? "" : `-round-${round}`;
  const file = path.join(reportDir, `${id}-${kind}${suffix}.json`);
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
  return file;
}

function commitTaskChanges(id, worktree) {
  const status = sh(["git", "status", "--porcelain"], worktree);
  if (!status) return false;

  sh(["git", "add", "-A"], worktree);

  // If only ignored/private files exist, there may be nothing staged.
  const staged = sh(["git", "diff", "--cached", "--name-only"], worktree);
  if (!staged) return false;

  sh(
    ["git", "commit", "-m", `feat: complete ${id.toLowerCase()} ${taskSlug(id)}`],
    worktree
  );
  return true;
}

function commitCorrections(id, worktree, round) {
  const status = sh(["git", "status", "--porcelain"], worktree);
  if (!status) return false;

  sh(["git", "add", "-A"], worktree);
  const staged = sh(["git", "diff", "--cached", "--name-only"], worktree);
  if (!staged) return false;

  sh(
    ["git", "commit", "-m", `fix: address ${id.toLowerCase()} review round ${round}`],
    worktree
  );
  return true;
}

function completeTaskDocument(id, taskState) {
  const spec = tasks[id].spec;
  if (!spec?.startsWith("docs/tasks/active/")) return;

  const dirty = sh(["git", "status", "--porcelain"], taskState.worktree);
  if (dirty) {
    throw new Error(`${id} worktree has uncommitted changes; inspect and commit them before approval.`);
  }

  const source = path.join(taskState.worktree, spec);
  if (!existsSync(source)) {
    throw new Error(`Cannot complete missing task specification: ${spec}`);
  }

  const destinationRel = spec.replace(
    "docs/tasks/active/",
    "docs/tasks/completed/"
  );
  const destination = path.join(taskState.worktree, destinationRel);

  const taskWorkflowPath = path.join(taskState.worktree, "automation", "workflow.yaml");
  const taskWorkflow = readFileSync(taskWorkflowPath, "utf8");
  const sourceEntry = `spec: ${spec}`;
  if (!taskWorkflow.includes(sourceEntry)) {
    throw new Error(`Cannot update workflow entry for ${id}.`);
  }

  mkdirSync(path.dirname(destination), { recursive: true });
  renameSync(source, destination);
  writeFileSync(
    taskWorkflowPath,
    taskWorkflow.replace(sourceEntry, `spec: ${destinationRel}`)
  );

  sh(["git", "add", "-A"], taskState.worktree);
  sh(
    ["git", "commit", "-m", `docs: complete ${id.toLowerCase()} task`],
    taskState.worktree
  );
}

function dependenciesApproved(id, state) {
  return (tasks[id].depends_on ?? []).every(
    dep => state.tasks[dep]?.status === "APPROVED"
  );
}

function readyTasks(state) {
  return Object.keys(tasks).filter(
    id =>
      state.tasks[id].status === "PENDING" &&
      dependenciesApproved(id, state)
  );
}

async function runOneTask(id, state) {
  const taskState = state.tasks[id];
  const { worktree } = ensureWorktree(id, state);

  taskState.status = "RUNNING";
  taskState.last_error = null;
  saveState(state);

  console.log(`\n[${id}] Feature Agent started`);

  try {
    const codex = new Codex();

    let featureThread = codex.startThread({
      workingDirectory: worktree,
      sandboxMode: "workspace-write",
      approvalPolicy: "never",
      networkAccessEnabled: true,
      modelReasoningEffort: REASONING
    });

    const featureTurn = await featureThread.run(featurePrompt(id), {
      outputSchema: featureSchema
    });

    taskState.feature_thread_id = featureThread.id;
    const feature = parseStructured(featureTurn.finalResponse, `${id} feature agent`);
    writeReport(id, "feature", feature);

    if (feature.status === "BLOCKED") {
      taskState.status = "FAILED";
      taskState.last_error = feature.summary;
      saveState(state);
      console.log(`[${id}] BLOCKED: ${feature.summary}`);
      return;
    }

    commitTaskChanges(id, worktree);

    for (let round = 1; round <= MAX_REVIEW_ROUNDS; round++) {
      taskState.status = "REVIEWING";
      taskState.review_round = round;
      saveState(state);

      console.log(`[${id}] Reviewer round ${round}`);

      const reviewer = codex.startThread({
        workingDirectory: worktree,
        sandboxMode: "read-only",
        approvalPolicy: "never",
        networkAccessEnabled: false,
        modelReasoningEffort: REASONING
      });

      const reviewTurn = await reviewer.run(reviewerPrompt(id), {
        outputSchema: reviewSchema
      });

      taskState.review_thread_ids.push(reviewer.id);
      const review = parseStructured(reviewTurn.finalResponse, `${id} reviewer`);
      writeReport(id, "review", review, round);

      if (review.review === "PASS") {
        taskState.status = "WAITING_HUMAN";
        saveState(state);
        console.log(`[${id}] WAITING_HUMAN`);
        return;
      }

      if (round === MAX_REVIEW_ROUNDS) {
        taskState.status = "WAITING_HUMAN";
        taskState.last_error = "Reviewer still requests changes after automated review rounds.";
        saveState(state);
        console.log(`[${id}] WAITING_HUMAN (review issues remain)`);
        return;
      }

      console.log(`[${id}] Sending reviewer findings back to Feature Agent`);

      featureThread = codex.resumeThread(taskState.feature_thread_id, {
        workingDirectory: worktree,
        sandboxMode: "workspace-write",
        approvalPolicy: "never",
        networkAccessEnabled: true,
        modelReasoningEffort: REASONING
      });

      const correctionTurn = await featureThread.run(correctionPrompt(id, review), {
        outputSchema: featureSchema
      });

      const correction = parseStructured(
        correctionTurn.finalResponse,
        `${id} correction agent`
      );
      writeReport(id, "correction", correction, round);
      commitCorrections(id, worktree, round);
    }
  } catch (error) {
    taskState.status = "FAILED";
    taskState.last_error = error instanceof Error ? error.message : String(error);
    saveState(state);
    console.error(`[${id}] FAILED: ${taskState.last_error}`);
  }
}

async function runWithConcurrency(ids, limit, worker) {
  const queue = [...ids];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const id = queue.shift();
      await worker(id);
    }
  });
  await Promise.all(runners);
}

function printStatus(state) {
  console.log("\nTask status\n");
  for (const id of Object.keys(tasks)) {
    const deps = tasks[id].depends_on ?? [];
    const s = state.tasks[id];
    console.log(
      `${id.padEnd(9)} ${s.status.padEnd(15)} deps=[${deps.join(", ")}]`
    );
    if (s.last_error) console.log(`           note: ${s.last_error}`);
  }

  const ready = readyTasks(state);
  if (ready.length) console.log(`\nReady: ${ready.join(", ")}`);
}

function inspectTask(id, state) {
  assertTask(id);
  const s = state.tasks[id];
  console.log(`Task:     ${id}`);
  console.log(`Status:   ${s.status}`);
  console.log(`Branch:   ${s.branch ?? "-"}`);
  console.log(`Worktree: ${s.worktree ?? "-"}`);

  if (s.branch) {
    try {
      const stat = sh(["git", "diff", "--stat", `${BASE_BRANCH}...${s.branch}`]);
      console.log("\nDiff summary:\n" + (stat || "(no diff)"));
    } catch {}
  }

  const featureFile = path.join(reportDir, `${id}-feature.json`);
  if (existsSync(featureFile)) {
    console.log("\nFeature report:");
    console.log(readFileSync(featureFile, "utf8"));
  }

  for (let round = 1; round <= (s.review_round ?? 0); round++) {
    const reviewFile = path.join(reportDir, `${id}-review-round-${round}.json`);
    if (existsSync(reviewFile)) {
      console.log(`\nReview round ${round}:`);
      console.log(readFileSync(reviewFile, "utf8"));
    }
  }
}

function assertTask(id) {
  if (!id || !tasks[id]) {
    throw new Error(`Unknown task "${id ?? ""}".`);
  }
}

function requireCleanBase() {
  const current = sh(["git", "branch", "--show-current"]);
  if (current !== BASE_BRANCH) {
    throw new Error(`Main working copy must be on ${BASE_BRANCH}; currently ${current}.`);
  }
  const dirty = sh(["git", "status", "--porcelain"]);
  if (dirty) {
    throw new Error("Main working copy is not clean. Commit or stash changes first.");
  }
}

function validateWorkflow() {
  if (!Object.keys(tasks).length) {
    throw new Error("workflow.yaml does not define any tasks.");
  }
  if (!Number.isInteger(MAX_PARALLEL) || MAX_PARALLEL < 1) {
    throw new Error("settings.max_parallel must be a positive integer.");
  }
  if (!Number.isInteger(MAX_REVIEW_ROUNDS) || MAX_REVIEW_ROUNDS < 1) {
    throw new Error("settings.max_review_rounds must be a positive integer.");
  }

  for (const [id, task] of Object.entries(tasks)) {
    if (!task.spec || !existsSync(path.join(repoRoot, task.spec))) {
      throw new Error(`${id} references missing task specification "${task.spec ?? ""}".`);
    }
    for (const dependency of task.depends_on ?? []) {
      if (!tasks[dependency]) {
        throw new Error(`${id} references unknown dependency "${dependency}".`);
      }
      if (dependency === id) {
        throw new Error(`${id} cannot depend on itself.`);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error(`Dependency cycle detected at ${id}.`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of tasks[id].depends_on ?? []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of Object.keys(tasks)) visit(id);

  sh(["git", "rev-parse", "--verify", BASE_BRANCH]);
  console.log(`Workflow valid: ${Object.keys(tasks).length} tasks, base ${BASE_BRANCH}.`);
  console.log("No feature agents were started.");
}

function approveTask(id, state) {
  assertTask(id);
  const s = state.tasks[id];

  if (s.status !== "WAITING_HUMAN") {
    throw new Error(`${id} is ${s.status}, not WAITING_HUMAN.`);
  }

  requireCleanBase();

  completeTaskDocument(id, s);

  sh(["git", "merge", "--no-ff", s.branch, "-m", `merge: ${id.toLowerCase()} ${taskSlug(id)}`]);

  s.status = "APPROVED";
  s.last_error = null;
  saveState(state);

  console.log(`${id} APPROVED and merged into ${BASE_BRANCH}.`);
  console.log("Run `npm run agent:run` to start newly-unblocked tasks.");
}

function rejectTask(id, reason, state) {
  assertTask(id);
  const s = state.tasks[id];

  if (s.status !== "WAITING_HUMAN") {
    throw new Error(`${id} is ${s.status}, not WAITING_HUMAN.`);
  }

  s.status = "REJECTED";
  s.rejection_reason = reason || "Rejected by human reviewer.";
  saveState(state);

  console.log(`${id} REJECTED. No merge performed.`);
}

async function main() {
  const command = process.argv[2] ?? "status";
  const arg1 = process.argv[3];
  const rest = process.argv.slice(4);
  const hadState = existsSync(statePath);
  const state = loadState();

  if (command === "init") {
    console.log(
      hadState
        ? `State already exists; left unchanged: ${statePath}`
        : `State initialized: ${statePath}`
    );
    printStatus(state);
    return;
  }

  if (command === "status") {
    printStatus(state);
    return;
  }

  if (command === "validate") {
    validateWorkflow();
    return;
  }

  if (command === "run") {
    requireCleanBase();
    const ready = readyTasks(state);
    if (!ready.length) {
      printStatus(state);
      console.log("\nNo tasks are currently runnable.");
      return;
    }

    console.log(`Running: ${ready.join(", ")} (max parallel: ${MAX_PARALLEL})`);
    await runWithConcurrency(ready, MAX_PARALLEL, id => runOneTask(id, state));
    printStatus(loadState());
    return;
  }

  if (command === "inspect") {
    inspectTask(arg1, state);
    return;
  }

  if (command === "approve") {
    approveTask(arg1, state);
    return;
  }

  if (command === "reject") {
    rejectTask(arg1, rest.join(" "), state);
    return;
  }

  throw new Error(`Unknown command "${command}".`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
