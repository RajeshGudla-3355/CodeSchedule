# CodeSchedule — Subagent Roles

This document is the human-readable summary of the subagent orchestration
system. Machine-readable instructions for each agent live in
[`agents/`](../agents/), and pipeline state lives in
[`agents/status/`](../agents/status/).

---

## Pipeline

```
┌──────────┐   ┌───────────┐   ┌───────────┐   ┌────────┐   ┌──────────┐
│ ANALYST  │ ─▶│ ARCHITECT │ ─▶│ DEVELOPER │ ─▶│ TESTER │ ─▶│ REPORTER │
└──────────┘   └───────────┘   └───────────┘   └────────┘   └──────────┘
```

Each stage must mark `COMPLETE` in its status file before the next stage
begins. A `FAILED` status halts the pipeline and returns control to the
orchestrator, which decides whether to retry the same stage or kick back
to an earlier one.

---

## Roles at a glance

| Agent | One-line role | Owns |
|---|---|---|
| **Orchestrator** | Coordinates the pipeline, enforces ordering, handles failures | `agents/status/*`, `agents/tasks/*` |
| **Analyst** | Turns a task brief into a clear, testable spec | `agents/artifacts/analyst/*.md` |
| **Architect** | Designs the implementation plan from the spec | `agents/artifacts/architect/*.md` |
| **Developer** | Writes the code to match the plan | `apps/**`, `packages/**` |
| **Tester** | Writes and runs tests against the implementation | `apps/**/*.test.ts`, `apps/**/__tests__/**` |
| **Reporter** | Produces the final human-readable run report | `agents/artifacts/reporter/*.md` |

---

## Handoff rules

- **No skipping stages.** Developer must not start until Architect is
  `COMPLETE`.
- **No overlapping writes.** A file listed in an agent's "owns" section
  must not be touched by any other agent. If Developer needs a doc update,
  it raises a blocker, not an edit.
- **Status is the source of truth.** Agents decide what's next by reading
  `agents/status/*.md`, not by reading conversation history.
- **Failure is explicit.** On failure, the agent writes `status: FAILED`
  with a `blockers:` paragraph, and the orchestrator routes from there.

See individual agent files in [`agents/`](../agents/) for the full
contract of each role.
