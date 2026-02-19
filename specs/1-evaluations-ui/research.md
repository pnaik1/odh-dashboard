# Research: Evaluations UI

**Phase**: 0 — Resolve NEEDS CLARIFICATION
**Date**: 2026-02-19
**Feature**: [spec.md](./spec.md) | [plan.md](./plan.md)

---

## Decision 1: Package Location & Architecture Pattern

**Decision**: Implement as `packages/eval-hub` (modular architecture package), following
the identical pattern used by `packages/gen-ai` and `packages/maas`.

**Rationale**: The `packages/eval-hub` skeleton already exists in the repo with a BFF
directory stub and a frontend `.gitkeep`. The CLAUDE.md instructs agents to follow the same
AGENTS.md. The gen-ai and maas packages provide proven reference implementations for:
Module Federation setup, Go BFF with client factory, mock client flags, Makefile targets,
Dockerfile multi-stage build, and Cypress contract tests. Reusing this pattern minimizes
architectural risk and keeps the team in familiar territory.

**Alternatives considered**:
- Upstream Trusty community — rejected for summit timeline constraints (per Eder
  Ignatowicz's comment in RHAISTRAT-1134).
- Extending core `frontend/` directly — rejected: violates Principle 1 (Modular Package
  Architecture) of the project constitution.
- Reusing `packages/lm-eval` — rejected: lm-eval is a thin shim for direct lm-eval-harness
  integration; eval-hub uses the orchestration control plane with a different API surface.
  The two should coexist; lm-eval for direct use, eval-hub for the UI over the control plane.

---

## Decision 2: BFF Role — Proxy vs. Adapter

**Decision**: The eval-hub BFF acts as an **authenticated proxy-adapter**. It:
1. Forwards the user's OAuth `Bearer` token (extracted by the OAuth sidecar) to the Eval Hub
   API in the `Authorization` header.
2. Performs light shape-mapping between the Eval Hub API response and the frontend's TypeScript
   types (flattening nested pagination, normalizing status enums).
3. Provides a mock client (`--mock-eh-client=true`) that returns static fixture data for
   offline development.

**Rationale**: The Eval Hub API ([eval-hub.github.io](https://eval-hub.github.io/eval-hub/index-private.html#tag/Collections))
already has a well-defined OpenAPI schema with the exact endpoints needed (jobs, collections,
benchmarks, providers). The BFF does not need to own business logic — it serves as a
secure, authenticated intermediary that the React frontend can call without needing cluster
credentials directly.

**Alternatives considered**:
- Frontend calling Eval Hub API directly — rejected: violates Principle 7 (Security) and
  Principle 3 (BFF pattern). Tokens would be exposed to the browser; no server-side auth
  control.
- Full server-side aggregation (BFF fetching from multiple services and composing) — deferred
  to post-MVP if the UI needs to join Eval Hub data with K8s model deployment metadata.

---

## Decision 3: Status Polling vs. SSE/WebSocket

**Decision**: Use **client-side polling** at a 10-second interval for running evaluations.
The `useEvaluations` hook polls `GET /api/v1/evaluations/jobs` when any run is in Pending
or Running state; it stops polling when all runs are in a terminal state.

**Rationale**: The Eval Hub API
([GET /api/v1/evaluations/jobs](https://eval-hub.github.io/eval-hub/index-private.html#tag/Collections))
exposes a standard REST list endpoint with `status_filter` query param and no documented
SSE/WebSocket push mechanism in the v0.0.1 spec. Polling is simpler to implement, easier to
test (mock timers), and sufficient for the 15-second status update SLA defined in SC-002.

**Spike SP-003 outcome (assumed)**: No push mechanism available in MVP API. Revisit for v2
if backend team adds SSE support.

**Alternatives considered**:
- SSE from BFF — not available in current Eval Hub API spec; would require backend work.
- Long-polling — adds server-side complexity; not warranted at this scale.

---

## Decision 4: MLFlow Availability Detection

**Decision**: The BFF exposes a `GET /api/v1/health` endpoint that includes an `mlflow`
component in the health response. On startup, the frontend calls this endpoint; if MLFlow
is reported as unhealthy or absent, the `EvaluationsListPage` renders
`MLFlowNotEnabledEmptyState` instead of the evaluations table.

**Rationale**: The Eval Hub API itself returns health component status in
`GET /api/v1/health` → `components` map. The BFF can surface this directly. This avoids the
frontend needing K8s service discovery; the BFF (which runs in-cluster) is the right layer
to check connectivity to MLFlow.

**Spike SP-004 outcome (assumed)**: BFF health endpoint approach preferred over frontend
polling K8s APIs. Aligns with existing gen-ai BFF health check pattern.

**Alternatives considered**:
- Dashboard-level MLFlow detection (checking a Dashboard config API) — viable but couples
  this package to the core dashboard config API. Deferring to post-MVP.

---

## Decision 5: lm-eval vs. eval-hub Scope Boundary

**Decision**: The two packages serve distinct purposes and MUST coexist:
- `packages/lm-eval` — wraps the lm-eval Kubernetes Operator CRD directly (job submission
  via K8s CR, not via Eval Hub). Provides direct lm-eval-harness access for advanced users.
- `packages/eval-hub` — provides the Evaluations UI backed by the Eval Hub control plane.
  This is the primary user-facing evaluation experience for general AI developers.

**Rationale**: The Eval Hub control plane orchestrates across multiple frameworks
(lm-eval-harness, Garak, RAGAS, etc.). The eval-hub UI is the abstraction layer over all
of them. lm-eval direct access may be surfaced as an advanced/alternative path in the future.

**Spike SP-002 outcome (assumed)**: Teams agree to keep both packages; lm-eval remains for
direct operator-level access; eval-hub is the UI-facing feature described in RHAISTRAT-1134.

---

## Decision 6: Module Federation Port Assignment

**Decision**: Assign port `8343` to the eval-hub BFF service, following the established
sequence in the federation ConfigMap:
- `modelRegistry`: 8043
- `genAi`: 8143
- `maas`: 8243
- `evalHub`: **8343** ← new

**Rationale**: Sequential port assignment in the 80x3 range is the established convention.
Port 8343 has not been claimed by any other package in the current codebase.

---

## Decision 7: Frontend Routing & Navigation

**Decision**: The eval-hub package registers the following routes via Module Federation
extensions:
- `/evaluations` → `EvaluationsListPage`
- `/evaluations/new` → `NewEvaluationPage`
- `/evaluations/collections` → `CollectionsPage`
- `/evaluations/benchmarks` → `BenchmarksPage`
- `/evaluations/:id` → `EvaluationDetailPage`

Navigation entry is added to the RHOAI Dashboard sidebar under a new "Evaluations" section
via the MF extensions system (`extensions.ts`), consistent with how gen-ai and model-registry
register their nav items.

---

## Open Questions (Spike-Gated)

| ID | Question | Spike | Resolution Target |
|----|----------|-------|-------------------|
| OQ-001 | Does Eval Hub API require a service-account token or user OAuth token? | SP-001 | Sprint 1 |
| OQ-002 | Is the `--mock-mr-client` flag in the existing launch.json meant for "model registry" or something else? | SP-002 | Sprint 1 |
| OQ-003 | Should the eval-hub BFF communicate with the Eval Hub backend directly, or via an in-cluster service mesh? | SP-001 | Sprint 1 |
| OQ-004 | What is the Eval Hub service name and namespace in OpenShift? | SP-001 | Sprint 1 |

