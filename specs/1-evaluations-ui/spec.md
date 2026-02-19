# Feature Specification: Evaluations UI

**Feature Branch**: `1-evaluations-ui`
**Created**: 2026-02-19
**Status**: Draft
**STRAT**: [RHAISTRAT-1134](https://issues.redhat.com/browse/RHAISTRAT-1134)
**API Reference**: [Eval Hub API](https://eval-hub.github.io/eval-hub/index-private.html#tag/Collections)

---

## Overview

The Evaluations UI brings the power of the evaluation stack control plane (RHAISTRAT-26) to
general AI developers through a first-class RHOAI Dashboard experience. Rather than requiring
expert-level knowledge to configure and run evaluation frameworks, benchmarking tools, or
profiling runs manually, this feature provides a guided UI that lets any user assess model
quality, safety, and domain fit using curated evaluation collections and standardized
benchmarks — with results persisted and visualized through MLFlow.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse & Trigger Evaluation Collections (Priority: P1)

An AI developer wants to know whether their deployed model or AI application endpoint is
suitable for a specific industry (e.g., healthcare, finance) or use case (e.g., safety,
code generation). They navigate to the **Evaluations** section of the RHOAI Dashboard,
browse the curated **Evaluation Collections**, select one that matches their domain, provide
their model endpoint (and optionally an API key), give the run a name, and trigger the
evaluation. The system submits the job to Eval Hub, confirms the run is scheduled, and the
user can see it appear in the Evaluation Runs list with a **Pending** status.

**Why this priority**: This is the primary value proposition — enabling non-expert users to
run cross-framework, industry-relevant evaluations with a single action. It is the minimal
deliverable that differentiates this feature.

**Independent Test**: Can be tested end-to-end by selecting "Open LLM Leaderboard v2",
providing a valid endpoint, submitting, and confirming a new evaluation run appears in the
list with a Pending/Running status.

**Acceptance Scenarios**:

1. **Given** a user is on the Evaluations page, **When** they click "New Evaluation" and
   select "Evaluation Collection", **Then** they see a grid of available collections with
   name, description, industry tag, and benchmark count visible.

2. **Given** a user has selected a collection, **When** they fill in evaluation name,
   model endpoint URL, and submit, **Then** a new evaluation run appears in the Evaluation
   Runs list with status "Pending" or "Running".

3. **Given** a user provides an invalid or unreachable endpoint URL, **When** they submit,
   **Then** the form displays a clear validation error before submission and the run is not
   created.

4. **Given** the user wants to filter collections by industry, **When** they apply the
   "Industry" filter, **Then** only collections matching the selected industry tag are
   displayed.

5. **Given** MLFlow is not enabled in the cluster, **When** a user navigates to
   Evaluations, **Then** a graceful error page is shown explaining that MLFlow must be
   enabled to use this feature.

---

### User Story 2 — Monitor Running Evaluations & View Results (Priority: P1)

After triggering an evaluation, the developer wants to track its progress and — once
complete — review the results without leaving the RHOAI Dashboard. They see a live-updating
Evaluation Runs list showing each run's status (Pending, Running, Completed, Failed). On the
results page, they see a per-benchmark summary (benchmark name, score achieved vs. threshold,
Pass/Fail verdict) and a link that deep-links them into the MLFlow experiment for full
artifact and metric detail.

**Why this priority**: Visibility into run state and results is inseparable from the value of
triggering an evaluation. Without this, users cannot act on the output.

**Independent Test**: Can be tested using an existing completed evaluation run from mock
data: verify status badges render, a results page shows benchmark cards, and the MLFlow link
navigates correctly.

**Acceptance Scenarios**:

1. **Given** a running evaluation, **When** the user views the Evaluation Runs list, **Then**
   the run shows a "Running" status indicator and the list updates to reflect state changes
   without a full page reload.

2. **Given** a completed evaluation, **When** the user clicks the evaluation name, **Then**
   a results page shows: overall pass/fail, each benchmark's name, score, threshold, and
   pass/fail status.

3. **Given** a completed evaluation linked to an MLFlow experiment, **When** the user clicks
   "See detailed results", **Then** they are navigated to the corresponding MLFlow experiment
   view in a new tab.

4. **Given** an evaluation that ended with status "Failed", **When** the user views the run,
   **Then** an error message or reason is displayed alongside the Failed status badge.

5. **Given** a running evaluation, **When** the user clicks "Cancel", **Then** the run is
   cancelled via the Eval Hub API and its status updates to "Cancelled" in the list.

---

### User Story 3 — Manage Evaluation Run History (Priority: P2)

A developer or team lead wants to review past evaluations across multiple models to compare
performance over time and audit which models have been assessed. They view the Evaluation
Runs table, which lists all runs with: name, collection/benchmark used, date, what was
evaluated (model/endpoint), status, and result (score or error). They can search and filter
the list, and navigate to any past result.

**Why this priority**: Historical visibility is critical for governance, model comparison,
and iterative improvement, but it does not block the core trigger-and-monitor flow.

**Independent Test**: Can be tested independently with a pre-populated list of evaluation
runs (mocked) by verifying the table renders all columns, pagination works, and clicking a
completed run opens its results.

**Acceptance Scenarios**:

1. **Given** multiple past evaluation runs exist, **When** the user views the Evaluations
   page, **Then** all runs are listed in a table sorted by date (most recent first) with
   name, collection, date, evaluated target, status, and result columns visible.

2. **Given** a list of evaluation runs, **When** the user types in the "Filter by name"
   field, **Then** the table narrows to only rows whose name contains the search string.

3. **Given** more than one page of runs exists, **When** the user navigates between pages,
   **Then** the correct subset of runs is displayed and pagination controls reflect total
   count.

4. **Given** a run with status "Failed", **When** it is displayed in the table, **Then** it
   is visually distinguished (e.g., red badge) from "Completed" runs (green badge).

---

### User Story 4 — Trigger Individual Benchmark Evaluations (Priority: P2 / P1-Stretch)

A power user who knows exactly which benchmark they want to run (e.g., MMLU from
lm-eval-harness) wants to trigger a targeted evaluation without using a full collection.
They select "Standardized Benchmarks" from the New Evaluation flow, browse available
benchmarks with name, description, and metrics, configure endpoint/dataset location and
optional JSON arguments, and submit.

**Why this priority**: Individual benchmarks (P1 in the requirements) allow more granular
control. Collections cover the broadest set of users first; individual benchmarks extend
reach to power users.

**Independent Test**: Can be tested independently by selecting a single benchmark (e.g.,
"MMLU Comprehensive"), configuring an endpoint, and verifying a new evaluation run appears.

**Acceptance Scenarios**:

1. **Given** the user selects "Standardized Benchmarks" on the New Evaluation screen,
   **When** the benchmark list loads, **Then** each benchmark shows its name, description,
   category, and primary metric.

2. **Given** the user has selected a benchmark and filled in the endpoint, **When** they
   optionally upload a JSON arguments file, **Then** the form accepts the file and includes
   it with the evaluation request.

3. **Given** the user submits a single-benchmark evaluation, **When** the run completes,
   **Then** the results page shows the single benchmark's score and pass/fail with a link to
   MLFlow.

---

### Edge Cases

- What happens when the Eval Hub backend is unavailable? The UI must display a meaningful
  connectivity error and not silently fail or show an empty state.
- What happens when a collection has zero available benchmarks from the provider? The
  collection card should reflect this and disable the "Run collection" action with an
  explanatory tooltip.
- What happens when the user provides a model endpoint with an expired or missing API key?
  The evaluation may still be submitted (the key is forwarded to the backend); the failure
  will surface as a Failed run with a backend error message.
- What happens if the user navigates away during a running evaluation? The run continues on
  the backend; the status is visible upon returning to the Evaluations list.
- What happens when an evaluation run has no MLFlow experiment associated (e.g., MLFlow was
  disabled mid-run)? The "See detailed results" link is hidden and a note explains that
  detailed results are unavailable.
- What happens with very large evaluation datasets or many benchmark results? The results
  page must paginate or virtualize benchmark result cards to remain performant.
- What happens when a user triggers an evaluation for a project they do not have write access
  to? The system must enforce project-level isolation and return a permissions error.

---

## Requirements *(mandatory)*

### Functional Requirements

**Evaluation Runs**

- **FR-001**: The system MUST display a list of all evaluation runs for the selected project
  scope, including columns for: evaluation name, collection/benchmark used, date ran, what
  was evaluated (model/endpoint name), status, and result.
- **FR-002**: The system MUST reflect real-time evaluation run status (Pending, Running,
  Completed, Failed, Cancelled) by polling or subscribing to the Eval Hub API.
- **FR-003**: Users MUST be able to cancel a running evaluation from the Evaluation Runs
  list or run detail view.
- **FR-004**: The system MUST allow users to filter evaluation runs by name.
- **FR-005**: The system MUST paginate the evaluation runs list when more than one page of
  results exists.
- **FR-006**: The system MUST display a graceful error page when MLFlow is not enabled,
  preventing access to the Evaluations feature until it is configured.

**Triggering Evaluations**

- **FR-007**: Users MUST be able to initiate a new evaluation by selecting either
  "Evaluation Collection" or "Standardized Benchmarks" as the evaluation type.
- **FR-008**: When triggering an evaluation via a collection, users MUST provide: an
  evaluation name, and a model/agent endpoint URL. An API key field MUST be available but
  optional.
- **FR-009**: The system MUST validate that the evaluation name and endpoint URL are
  non-empty before submission.
- **FR-010**: Users MUST be able to upload an optional JSON file to supply additional
  evaluation arguments when configuring any evaluation run.
- **FR-011**: Upon successful submission, the new evaluation run MUST immediately appear in
  the Evaluation Runs list with a Pending or Running status.

**Collections**

- **FR-012**: The system MUST display a browsable list of available evaluation collections,
  showing: name, description, industry/category tag, and benchmark count.
- **FR-013**: Users MUST be able to filter collections by industry/category tag.
- **FR-014**: Users MUST be able to search collections by name.
- **FR-015**: Each collection entry MUST provide a direct "Run collection" action that
  navigates to the evaluation configuration form pre-populated with that collection.

**Benchmarks (P1-Stretch / P2)**

- **FR-016**: The system MUST display a browsable list of individual benchmarks with name,
  description, category, and primary metric.
- **FR-017**: When triggering a benchmark evaluation, users MUST be able to specify an
  endpoint/dataset location and optionally upload JSON arguments.

**Results**

- **FR-018**: The results page for a completed evaluation MUST display: overall pass/fail
  verdict, a card per benchmark showing benchmark name, score achieved, threshold, and
  pass/fail status.
- **FR-019**: The results page MUST provide a clearly labeled link to the corresponding
  MLFlow experiment for detailed metrics and artifacts.
- **FR-020**: The results page for a failed evaluation MUST display the error message or
  failure reason returned by the Eval Hub backend.

**Project Isolation**

- **FR-021**: Evaluation runs MUST be scoped to the user's selected project; runs from other
  projects MUST NOT be visible.
- **FR-022**: The system MUST enforce user permission checks; users without write access to a
  project MUST NOT be able to trigger evaluations within that project.

### Key Entities

- **Evaluation Run**: A single execution job submitted to Eval Hub. Key attributes: id,
  name, status (pending/running/completed/failed/cancelled), date created, model/endpoint
  reference, collection or benchmark reference, result summary, MLFlow experiment URL.
- **Evaluation Collection**: A curated set of benchmarks grouped by industry or use case.
  Key attributes: id, name, description, industry/category tags, list of benchmarks,
  pass criteria threshold.
- **Benchmark**: An individual evaluation task with a defined scoring method. Key attributes:
  id, provider_id, name, description, category, primary metric, pass criteria threshold.
- **Result Summary**: Per-benchmark outcome within a completed run. Key attributes: benchmark
  id, score achieved, threshold, pass/fail verdict.
- **Provider**: A backend evaluation framework (e.g., lm-eval-harness, Garak, RAGAS) that
  supplies benchmarks to Eval Hub.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users with no prior knowledge of evaluation frameworks can successfully trigger
  an evaluation collection run in under 3 minutes from landing on the Evaluations page.
- **SC-002**: 90% of evaluation run status updates are reflected in the UI within 15 seconds
  of the actual state change on the backend.
- **SC-003**: Users can view a complete benchmark-level results summary for any completed
  run without leaving the RHOAI Dashboard.
- **SC-004**: The Evaluations page remains responsive (no perceptible lag) when displaying
  lists of up to 100 evaluation runs or 50 benchmark result cards.
- **SC-005**: Zero evaluation runs from other projects are ever visible to a user due to
  project-isolation enforcement.
- **SC-006**: When MLFlow is not enabled, 100% of navigation attempts to the Evaluations
  feature result in a clear, actionable error message — never a blank page or unhandled
  exception.
- **SC-007**: The "See detailed results" deep link successfully navigates to the correct
  MLFlow experiment for 100% of completed runs that have an associated MLFlow experiment ID.

---

## Assumptions

- The Eval Hub API ([eval-hub.github.io/eval-hub](https://eval-hub.github.io/eval-hub/index-private.html#tag/Collections))
  is available and stable for the MVP delivery window. API contract changes will require
  spec revision.
- MLFlow is a hard dependency for the feature to function. If MLFlow is not enabled, the
  entire Evaluations section surfaces an error state; this is a known, intended behavior.
- The evaluation backend (RHAISTRAT-26) and evaluation collections (RHAISTRAT-1147) APIs are
  delivered and functionally complete before UI development begins in earnest.
- Users have already deployed their model and have a valid, reachable endpoint URL before
  using this feature. Endpoint provisioning is explicitly out of scope.
- Project-level isolation relies on the existing RHOAI project scoping infrastructure
  already present in the Dashboard; no new RBAC primitives need to be created.
- The "Offline / Dataset" evaluation input mode (input file URI) is noted in the requirements
  but deferred for post-MVP; the MVP focuses on live endpoint evaluation.
- The existing `packages/lm-eval` package and `/frontend/src/pages/lmEval` represent a
  prior iteration; the strategy for reuse vs. replacement MUST be aligned before
  implementation begins (noted risk).
- This feature will be implemented as a modular architecture package (preferred over upstream
  Trusty community approach, per Eder Ignatowicz's comment in RHAISTRAT-1134) to meet the
  summit timeline.

---

## Out of Scope (MVP)

- Latency/throughput profiling (Guidellm) — P2 Future
- Managing collections/benchmarks (create, edit, delete) — P2 Future
- Custom evaluations with user-provided datasets — P2 Future
- "Benchmark this model" integration from the Model Deployments page — P2 Future
- Playground integration (show eval scores during chat) — P2 Future
- Individual task-level results (below benchmark granularity) — P2 Future
- Artifact storage configuration UI (admin) — deferred to separate admin story

---

## Dependencies & Risks

- **Dependency**: Eval Hub backend API (RHAISTRAT-26) — must be available with stable
  OpenAPI contract before UI implementation.
- **Dependency**: MLFlow integration — required for experiment creation and result
  persistence; MLFlow must be deployed in the target cluster.
- **Risk**: The existing `lm-eval` package/page overlaps in scope. Failure to align on the
  strategy early could create duplicate UI surfaces or conflicting user experiences.
- **Risk**: Eval Hub API contract changes mid-development could require rework. A formal
  contract test suite between the UI and the BFF (if one is added) should be agreed upon
  before sprint 1.
- **Risk**: Performance with large evaluation result sets (many benchmarks, many metrics) is
  unproven; a spike may be needed before committing to visualization design.

