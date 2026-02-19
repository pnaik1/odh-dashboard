# Tasks: Evaluations UI

**STRAT**: [RHAISTRAT-1134](https://issues.redhat.com/browse/RHAISTRAT-1134) | **Branch**: `1-evaluations-ui`

> **[P]** = can run in parallel | 🎯 P1 MVP | 🔶 P1-Stretch | 🔷 P2

---

## Epic 1 — Foundation 🎯

> Runnable package skeleton. **Blocks all other epics.**

- [ ] SP-1 **[Spike]** Confirm Eval Hub API auth (user OAuth token vs service-account) + service name/namespace in OpenShift + align `lm-eval` vs `eval-hub` team scope *(2 days)*
- [ ] SP-2 **[Spike]** Confirm no SSE/WebSocket in Eval Hub API (default 10 s polling) + MLFlow detection strategy in BFF *(1 day)*
- [ ] T01 Register `evalHub` in `federation-configmap.yaml` (port 8343) + Kustomize manifests (deployment patch, service patch, params.env)
- [ ] T02 Scaffold BFF — `go.mod`, `cmd/main.go`, `config.go`, `app.go`, `errors.go`, `healthcheck_handler.go`, `Makefile`
- [ ] T03 [P] Implement `EvalHubClient` interface + Go types + real HTTP client + factory (`client.go`, `types.go`, `client_impl.go`, `factory.go`)
- [ ] T04 [P] Implement `MockEvalHubClient` with static fixtures for all interface methods
- [ ] T05 [P] Scaffold frontend — `package.json` (MF: name=evalHub, port=8343), `webpack.config.js`, `extensions.ts`, `types.ts`, `const.ts`

**Checkpoint**: `make run MOCK_EH_CLIENT=true` → 200 on `/api/v1/health`. MF remote loads at `localhost:9103/remoteEntry.js`.

---

## Epic 2 — Collections Browse 🎯

> Users browse and filter evaluation collections. *(US1 — step 1)*

- [ ] T06 BFF: `GET /api/v1/evaluations/collections` + `GET /collections/:id` handlers + contract test
- [ ] T07 [P] Frontend: `CollectionCard.tsx` + `CollectionsPage.tsx` (grid, tag filter, name search) + `useCollections` hook + Cypress component tests

**Checkpoint**: Collections page shows cards from mock data; filter + search work independently.

---

## Epic 3 — Trigger Evaluation 🎯

> Users configure and submit an evaluation run via a collection. *(US1 — core flow)*

- [ ] T08 BFF: `POST /api/v1/evaluations/jobs` handler + contract test
- [ ] T09 [P] Frontend: `NewEvaluationPage.tsx` (type selection) + `NewEvaluationWizard.tsx` (select collection → configure → submit) + `validation.ts` + Cypress component tests

**Checkpoint**: Select collection → fill form → submit → new run appears in mock list.

---

## Epic 4 — Runs List & Status Monitoring 🎯

> Users see a live-updating list of runs and can cancel them. *(US1 + US2)*

- [ ] T10 BFF: `GET /api/v1/evaluations/jobs` (paginated) + `GET /:id` + `DELETE /:id` (cancel) handlers + contract tests
- [ ] T11 Frontend: `useEvaluations.ts` polling hook (10 s, stops on terminal state) + `useHealth.ts`
- [ ] T12 [P] Frontend: `EvaluationStatusBadge.tsx` + `EvaluationRunsTable.tsx` (all columns, cancel kebab, pagination) + `MLFlowNotEnabledEmptyState.tsx`
- [ ] T13 [P] Frontend: `EvaluationsListPage.tsx` (New Evaluation button, name filter, MLFlow gate on mount) + Cypress component tests

**Checkpoint**: Runs list polls live; cancel fires DELETE; MLFlow gate shows empty state.

---

## Epic 5 — Results Detail 🎯

> Users view per-benchmark results and deep-link to MLFlow. *(US2)*

- [ ] T14 Frontend: `useEvaluation.ts` (polls while running) + `BenchmarkResultCard.tsx` (score, threshold, pass/fail, metrics)
- [ ] T15 [P] Frontend: `EvaluationDetailPage.tsx` (breadcrumb, benchmark grid, MLFlow link, error banner for failed runs) + register `/evaluations/:id` route + Cypress component tests + contract test

**Checkpoint**: Click completed run → benchmark cards + MLFlow deep-link. Full US1 + US2 end-to-end done. **MVP ✅**

---

## Epic 6 — Individual Benchmarks 🔶

> Power users browse and trigger individual benchmark evaluations. *(US4)*

- [ ] T16 BFF: `GET /api/v1/evaluations/providers?include_benchmarks=true` handler + contract test
- [ ] T17 [P] Frontend: `BenchmarksPage.tsx` (grouped by provider, multi-select) + extend `NewEvaluationWizard` with benchmarks path + Cypress component tests

**Checkpoint**: Select benchmark → configure → submit → run appears in list.

---

## Epic 7 — Run History & Polish 🔷

> Full run history table, production build, and hardening. *(US3)*

- [ ] T18 Extend `EvaluationRunsTable.tsx` — column sorting, debounced name filter, Failed/Completed row styling, pagination at scale + Cypress tests
- [ ] T19 [P] Add `Dockerfile` + `Dockerfile.workspace`; BFF unit tests for all handlers; `golangci-lint` config; `jest.config.ts`; `tsconfig.json`
- [ ] T20 [P] Validate `quickstart.md` end-to-end; security review (no tokens in logs, CORS config verified)

---

## Sprint Plan

| Sprint | Epics | Goal |
|--------|-------|------|
| 1 | Epic 1 | Runnable foundation |
| 2 | Epic 2 + 3 | Collections + trigger flow |
| 3 | Epic 4 + 5 | Monitor + results (**MVP ✅**) |
| 4 | Epic 6 + 7 | Benchmarks, history, polish |

---

## Notes

- `[P]` tasks = different files, no shared dependency — safe to parallelize
- All `TODO` comments MUST reference a Jira key: `// TODO(RHAISTRAT-XXXX): ...`
- BFF mock client (`MOCK_EH_CLIENT=true`) MUST stay in sync with new handler additions
- Commit after each epic checkpoint; do not advance until checkpoint is verified
