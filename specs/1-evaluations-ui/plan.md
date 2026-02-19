# Implementation Plan: Evaluations UI

**Branch**: `1-evaluations-ui` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**STRAT**: [RHAISTRAT-1134](https://issues.redhat.com/browse/RHAISTRAT-1134)

---

## Summary

Build a first-class Evaluations UI inside the RHOAI Dashboard as a modular architecture
package (`packages/eval-hub`). The package provides a React/TypeScript/PatternFly v6
frontend (Module Federation remote) and a Go BFF that proxies authenticated requests to the
external Eval Hub REST API. Users can browse curated evaluation collections, trigger
evaluation runs against model endpoints, monitor run status, and view per-benchmark
pass/fail results with deep links into MLFlow for detailed artifacts.

---

## Technical Context

**Language/Version**: TypeScript 5.x (frontend) · Go ≥ 1.24 (BFF)
**Primary Dependencies**:
- Frontend: React 18, PatternFly v6, Webpack Module Federation (`@odh-dashboard/plugin-core`,
  `@odh-dashboard/internal`)
- BFF: `httprouter`, `sigs.k8s.io/controller-runtime/pkg/client` (K8s auth),
  `log/slog`, `go.opentelemetry.io` (following gen-ai BFF pattern)
**Storage**: None (stateless BFF; all state owned by Eval Hub + MLFlow backends)
**Testing**: Jest + React Testing Library (frontend unit/component) · `go test` + Ginkgo
  (BFF unit) · Cypress component + mock tests · contract tests via
  `@odh-dashboard/contract-tests`
**Target Platform**: OpenShift (Kubernetes) · Module Federation host: ODH Dashboard shell
**Project Type**: Modular monorepo package (web application with BFF)
**Performance Goals**:
- Evaluations list renders ≤ 100 rows without perceptible lag
- Status polling interval ≤ 10 s for running evaluations
- Collection grid (≤ 50 cards) renders within 200 ms of data receipt
**Constraints**:
- Package MUST follow modular architecture conventions (Module Federation, BFF pattern,
  Kustomize manifests, federation ConfigMap registration)
- BFF MUST proxy to Eval Hub API using the user's OAuth token (via Authorization header
  forwarding)
- MLFlow availability check MUST gate the entire feature; no Evaluations UI without MLFlow
- BFF port assignment: `8343` (following gen-ai=8143, maas=8243 sequence)
- Federation name: `evalHub` (camelCase, per Principle 2 of constitution)
**Scale/Scope**: Single team MVP; ~10 screens/pages; ~15 BFF endpoint handlers

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| P1 — Modular Package Architecture | ✅ PASS | `packages/eval-hub` already scaffolded; no circular deps planned |
| P2 — Federated UI via Module Federation | ✅ PASS | Will register `evalHub` in federation-configmap.yaml; all integration via MF runtime |
| P3 — BFF per Feature Package | ✅ PASS | Go BFF in `packages/eval-hub/bff/`; OpenAPI spec in `packages/eval-hub/api/openapi/` |
| P4 — Kubernetes-Native Deployment | ✅ PASS | Will add deployment patch, service patch, federation entry at port 8343 |
| P5 — Type Safety & Code Quality | ✅ PASS | TypeScript strict mode; golangci-lint in BFF Makefile |
| P6 — Test Coverage Discipline | ✅ PASS | Unit + component/mock (Cypress) + contract tests planned |
| P7 — Security & Authorization | ✅ PASS | OAuth proxy enforced; BFF forwards Authorization header to Eval Hub; no secrets in code |

No constitution violations. Implementation may proceed.

---

## Project Structure

### Documentation (this feature)

```text
specs/1-evaluations-ui/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── eval-hub-bff.yaml   ← BFF OpenAPI contract
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code

```text
packages/eval-hub/
├── package.json                        # MF config: name=evalHub, port=8343
├── tsconfig.json
├── jest.config.ts
├── Makefile
├── Dockerfile
├── Dockerfile.workspace
│
├── api/
│   └── openapi/
│       └── eval-hub-bff.yaml           # BFF contract (from contracts/)
│
├── bff/                                # Go BFF
│   ├── cmd/
│   │   └── main.go
│   ├── Makefile
│   ├── go.mod
│   ├── go.sum
│   └── internal/
│       ├── api/
│       │   ├── app.go                  # App struct, Routes(), NewApp()
│       │   ├── errors.go
│       │   ├── healthcheck_handler.go
│       │   ├── evaluations_handler.go  # GET/POST /api/v1/evaluations/jobs
│       │   ├── evaluation_handler.go   # GET/DELETE /api/v1/evaluations/jobs/:id
│       │   ├── collections_handler.go  # GET /api/v1/evaluations/collections
│       │   ├── collection_handler.go   # GET /api/v1/evaluations/collections/:id
│       │   ├── benchmarks_handler.go   # GET /api/v1/evaluations/benchmarks
│       │   └── providers_handler.go    # GET /api/v1/evaluations/providers
│       ├── integrations/
│       │   └── evalhub/
│       │       ├── client.go           # EvalHubClient interface
│       │       ├── client_impl.go      # Real HTTP client wrapping Eval Hub API
│       │       ├── factory.go          # EvalHubClientFactory (singleton pattern)
│       │       ├── types.go            # Go structs matching Eval Hub API schema
│       │       └── mocks/
│       │           └── mock_client.go  # MockEvalHubClient
│       └── config/
│           └── config.go               # EnvConfig (EVAL_HUB_URL, port, etc.)
│
├── frontend/
│   ├── src/
│   │   ├── odh/
│   │   │   ├── extensions.ts           # MF extension registration
│   │   │   ├── ModArchWrapper.tsx
│   │   │   └── extension-points/
│   │   │       └── index.ts
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── EvaluationsListPage.tsx
│   │   │   │   ├── EvaluationDetailPage.tsx
│   │   │   │   ├── NewEvaluationPage.tsx
│   │   │   │   ├── CollectionsPage.tsx
│   │   │   │   └── BenchmarksPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── EvaluationRunsTable.tsx
│   │   │   │   ├── EvaluationStatusBadge.tsx
│   │   │   │   ├── CollectionCard.tsx
│   │   │   │   ├── BenchmarkResultCard.tsx
│   │   │   │   ├── NewEvaluationWizard.tsx
│   │   │   │   └── MLFlowNotEnabledEmptyState.tsx
│   │   │   ├── api/
│   │   │   │   ├── evaluations.ts      # fetch wrappers for BFF endpoints
│   │   │   │   ├── collections.ts
│   │   │   │   └── benchmarks.ts
│   │   │   └── utilities/
│   │   │       ├── useEvaluations.ts   # polling hook for run list
│   │   │       ├── useEvaluation.ts    # polling hook for single run
│   │   │       └── const.ts
│   │   └── __tests__/
│   │       ├── unit/
│   │       └── cypress/
│   └── webpack.config.js
│
└── contract-tests/
    └── eval-hub-consumer.ts
```

**Structure Decision**: Web application (Option 2 variant) — React frontend + Go BFF,
following the identical pattern as `packages/gen-ai` and `packages/maas`. The BFF acts as
an authenticated proxy/adapter to the external Eval Hub REST API.

---

## Complexity Tracking

No constitution violations. No complexity justification required.

---

## Epic Breakdown

> Per user request: breaking STRAT into epics and then into tasks/spikes.

### Epic 1 — Foundation & BFF Scaffold (Sprint 1)
**Jira**: Create as child story under RHAISTRAT-1134
**Goal**: Runnable `packages/eval-hub` package — BFF serving mock data, frontend shell
loading as MF remote, registered in federation ConfigMap.
- Spike: Confirm Eval Hub API contract stability and auth token forwarding mechanism
- Spike: Align lm-eval vs eval-hub strategy with team (reuse or replace)
- Task: Scaffold BFF (`cmd/`, `internal/api/app.go`, `config.go`, `healthcheck_handler.go`)
- Task: Implement `evalhub` client interface + mock client (`MOCK_EH_CLIENT=true`)
- Task: Wire federation ConfigMap entry (name=evalHub, port=8343)
- Task: Add Kustomize manifests (deployment patch, service patch, params.env)
- Task: Frontend package scaffold (`package.json`, `webpack.config.js`, `extensions.ts`)
- Task: Contract test harness setup (`contract-tests/eval-hub-consumer.ts`)

### Epic 2 — Evaluation Collections Browse (Sprint 1–2)
**Goal**: Users can browse and filter evaluation collections backed by live Eval Hub API.
- Task: BFF `GET /api/v1/evaluations/collections` handler
- Task: BFF `GET /api/v1/evaluations/collections/:id` handler
- Task: Frontend `CollectionsPage.tsx` with grid layout, industry tag filter, name search
- Task: Frontend `CollectionCard.tsx` component (name, description, tags, benchmark count)
- Task: Cypress component tests for CollectionCard and CollectionsPage (mock)
- Task: Contract test: GET /collections response shape

### Epic 3 — Trigger Evaluation via Collection (Sprint 2)
**Goal**: Users can configure and submit an evaluation run using a selected collection.
- Task: BFF `POST /api/v1/evaluations/jobs` handler (maps frontend form → Eval Hub payload)
- Task: Frontend `NewEvaluationPage.tsx` — type selection screen (Collection vs Benchmarks)
- Task: Frontend `NewEvaluationWizard.tsx` — collection selection → configure → submit
  (evaluation name, endpoint URL, optional API key, optional JSON upload)
- Task: Frontend form validation (required fields, URL format)
- Task: Cypress component tests for the wizard flow
- Task: Contract test: POST /evaluations/jobs request/response shape

### Epic 4 — Evaluation Runs List & Status Monitoring (Sprint 2–3)
**Goal**: Users see a live list of evaluation runs with real-time status updates.
- Task: BFF `GET /api/v1/evaluations/jobs` handler (paginated, status filter)
- Task: BFF `DELETE /api/v1/evaluations/jobs/:id` (cancel) handler
- Task: Frontend `EvaluationsListPage.tsx` — table with name/collection/date/target/status/result
- Task: Frontend `useEvaluations.ts` polling hook (10 s interval for running evaluations)
- Task: Frontend `EvaluationStatusBadge.tsx` component (Pending/Running/Completed/Failed/Cancelled)
- Task: Cancel action (kebab menu → confirm → DELETE)
- Task: MLFlow not-enabled guard (`MLFlowNotEnabledEmptyState.tsx`)
- Task: Cypress component tests for list + polling behavior

### Epic 5 — Evaluation Results Detail (Sprint 3)
**Goal**: Users can view per-benchmark results and deep-link to MLFlow.
- Task: BFF `GET /api/v1/evaluations/jobs/:id` handler (full result shape)
- Task: Frontend `EvaluationDetailPage.tsx` — breadcrumb, metadata header, benchmark cards
- Task: Frontend `BenchmarkResultCard.tsx` — score, threshold, pass/fail badge, metric rows
- Task: MLFlow deep link button (hidden when `mlflow_experiment_url` is null)
- Task: Failed run error display
- Task: Cypress component tests for detail page + benchmark cards
- Task: Contract test: GET /evaluations/jobs/:id response shape

### Epic 6 — Individual Benchmarks (Sprint 3–4) [P2 / P1-Stretch]
**Goal**: Power users can browse and trigger individual benchmarks.
- Task: BFF `GET /api/v1/evaluations/benchmarks` + `GET /api/v1/evaluations/providers` handlers
- Task: Frontend `BenchmarksPage.tsx` — list with name/description/category/metric
- Task: Extend `NewEvaluationWizard.tsx` for single-benchmark path
- Task: Cypress component tests for benchmark selection flow
- Task: Contract test: GET /benchmarks response shape

### Spikes (time-boxed investigations)

| Spike | Goal | Box |
|-------|------|-----|
| SP-001 | Confirm Eval Hub API auth: does the BFF forward the user's OAuth token in `Authorization: Bearer` to Eval Hub, or does it use a service-account token? | 2 days |
| SP-002 | lm-eval vs eval-hub scope alignment — define strategy with team (keep lm-eval for direct lm-eval-harness integration, use eval-hub for orchestrated evaluations via control plane) | 1 day |
| SP-003 | Eval Hub API polling vs webhooks/SSE — is there a push mechanism for status updates or must the UI poll? Confirm polling interval recommendation with backend team. | 1 day |
| SP-004 | MLFlow availability detection — how does the Dashboard currently detect whether MLFlow is enabled? Reuse existing detection mechanism or implement new K8s service check in BFF? | 1 day |

