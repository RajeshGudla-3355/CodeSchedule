# Running the CodeSchedule agent pipeline

This is an operator's guide to running the five-stage subagent pipeline
defined in [`agents/`](../agents/). It is intentionally short — each
agent's contract lives in its own role file.

---

## TL;DR

1. Open Claude Code at the repo root.
2. Start the Orchestrator for `task-001`:
   > "Act as the Orchestrator agent defined in
   > `agents/orchestrator.md`. Kick off `agents/tasks/task-001.md`."
3. After each agent writes `status: COMPLETE`, start the next agent:
   > "Act as the Architect agent defined in `agents/architect.md`.
   > Process the task pointed at by `agents/status/architect-status.md`."
4. Monitor progress by reading the five files in `agents/status/`.

---

## 1. Starting the first run

Every run starts by briefing the Orchestrator on a task id. The
Orchestrator does **not** perform the downstream work — it:

1. Reads `agents/tasks/<task-id>.md`.
2. Writes `agents/artifacts/orchestrator/<task-id>-plan.md`.
3. Resets all five status files to `PENDING`.
4. Sets `agents/status/analyst-status.md` to `IN_PROGRESS` with
   `current_task: <task-id>`.

**First-run prompt (paste to a fresh Claude Code session):**

> You are the Orchestrator agent. Read `agents/orchestrator.md`.
> Then kick off `agents/tasks/task-001.md` following the rules in
> `CLAUDE.md`. Do not start any downstream agent — stop after setting
> the Analyst's status to `IN_PROGRESS`.

---

## 2. Advancing the pipeline, stage by stage

Each of the five stages is started with its own prompt. The agent
reads its role file, its input artifact, updates its own status, and
stops.

**Analyst:**
> You are the Analyst agent. Read `agents/analyst.md`. Your task is
> the one referenced by `agents/status/analyst-status.md`. Complete
> the stage end-to-end and mark your status `COMPLETE` or `FAILED`.

**Architect:**
> You are the Architect agent. Read `agents/architect.md`. Your
> input is the artifact named in `agents/status/architect-status.md`.
> Complete the stage and mark status.

**Developer:**
> You are the Developer agent. Read `agents/developer.md`. Follow
> the plan at the input artifact named in
> `agents/status/developer-status.md`. Complete the stage and mark
> status.

**Tester:**
> You are the Tester agent. Read `agents/tester.md`. Use the
> artifacts named in `agents/status/tester-status.md` as inputs.
> Complete the stage and mark status.

**Reporter:**
> You are the Reporter agent. Read `agents/reporter.md`. Synthesize
> all upstream artifacts for the current `current_task`. Complete
> the stage and mark status.

Between each stage, switch back to the Orchestrator to verify the
artifact exists and advance the next agent's status:

> You are the Orchestrator agent. The `<role>` just marked
> `COMPLETE`. Verify the artifact, append a decision to
> `agents/artifacts/orchestrator/<task-id>-decisions.md`, and set the
> next agent's status to `IN_PROGRESS`.

---

## 3. Monitoring progress

The pipeline is a filesystem-based state machine. Watch it with:

```bash
# Quick snapshot
grep -l "status:" agents/status/*.md | while read f; do
  echo "=== $f ==="
  head -10 "$f"
done

# Live watch (macOS/Linux with fswatch)
fswatch -o agents/status | xargs -n1 -I{} sh -c 'clear; grep -H status: agents/status/*.md'
```

Or open all five status files in a split view in your editor.

---

## 4. Re-running a failed agent

When an agent marks `FAILED`:

1. Read its status file's `blockers:` paragraph.
2. Read its artifact (if any) at
   `agents/artifacts/<role>/<task-id>.md`.
3. Decide: retry this stage with clarifying input, or roll back to
   the previous stage.

**To retry the same stage** with more context:

> You are the Orchestrator agent. `<role>` failed with the blockers
> above. We are retrying the same stage. Append an entry to
> `<task-id>-decisions.md` stating the retry reason, then set
> `agents/status/<role>-status.md` back to `IN_PROGRESS` with a
> `notes:` line summarizing the new context.

Then restart the agent with its normal prompt (above).

**To roll back** to a previous stage:

> You are the Orchestrator agent. `<role>` failed because the input
> from `<previous-role>` is inadequate. Append a rollback decision
> to `<task-id>-decisions.md`, set `<previous-role>`'s status back to
> `IN_PROGRESS` with notes on what to fix, and leave the failed
> stage and everything after it as `PENDING`.

---

## 5. Adding a new task to the pipeline

1. Create `agents/tasks/task-<NNN>.md` using `task-001.md` as a
   template. Keep the frontmatter fields: `task_id`, `title`,
   `status: READY`, `created`, `owner`.
2. Fill the sections: **Goal**, **In scope**, **Out of scope**,
   **Acceptance criteria**, **Handoff**. Acceptance criteria should
   be numbered and individually testable — the Analyst will expand
   them but good inputs produce good outputs.
3. Wait for the current run to finish (all five statuses `COMPLETE`
   or a terminal `FAILED`).
4. Start a fresh Orchestrator session with the first-run prompt
   above, swapping in the new task id.

---

## 6. Terminal states

A run is **done** when:

- All five `agents/status/*.md` are `COMPLETE` with the same
  `current_task`, **and**
- `agents/artifacts/reporter/<task-id>.md` exists and has a **Next
  action** of `CLOSE`, `HOLD`, or `ROLLBACK:...`.

If `Next action` is `CLOSE`, the task ships. If `HOLD`, the user
needs to answer the question recorded in the report before continuing.
If `ROLLBACK:<stage>`, follow the rollback instructions in §4.

---

## 7. Pitfalls

- **Don't let one agent do another agent's job.** If the Developer
  needs a design decision, they mark `FAILED`, not improvise.
- **Don't edit status files by hand during a run** unless you are
  explicitly operating as the Orchestrator. The state machine
  depends on clean transitions.
- **Don't skip the Orchestrator between stages.** It's the only
  thing that verifies artifacts are non-empty before the next stage
  starts.
- **Don't edit `agents/tasks/*.md` mid-run.** The task brief is
  immutable while the pipeline is running. Amend it by creating a
  follow-up task.
