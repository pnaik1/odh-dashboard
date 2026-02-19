# Data Model: Evaluations UI

**Phase**: 1 — Design
**Date**: 2026-02-19
**API Source**: [Eval Hub API v0.0.1](https://eval-hub.github.io/eval-hub/index-private.html#tag/Collections)

---

## Overview

All data is owned by the Eval Hub backend and MLFlow. The BFF and frontend hold no
persistent state. This document defines:
1. The **canonical TypeScript types** used in the frontend.
2. The **Go structs** used in the BFF when proxying Eval Hub responses.
3. **State transitions** for evaluation run lifecycle.

---

## 1. Core Entities

### EvaluationJob (Evaluation Run)

Maps to the Eval Hub `/api/v1/evaluations/jobs` resource.

```typescript
// packages/eval-hub/frontend/src/app/utilities/types.ts

export type EvaluationStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface EvaluationJobResource {
  id: string;
  tenant: string;
  created_at: string;         // ISO 8601
  updated_at: string;         // ISO 8601
  mlflow_experiment_id?: string;
  message?: EvaluationMessage;
}

export interface EvaluationMessage {
  message: string;
  message_code: string;
}

export interface EvaluationJobStatus {
  state: EvaluationStatus;
  message?: EvaluationMessage;
  benchmarks: BenchmarkJobStatus[];
}

export interface BenchmarkJobStatus {
  provider_id: string;
  id: string;
  status: EvaluationStatus;
  error_message?: EvaluationMessage;
  started_at?: string;        // ISO 8601
  completed_at?: string;      // ISO 8601
}

export interface BenchmarkResult {
  id: string;
  provider_id: string;
  metrics: Record<string, unknown>;
  artifacts: Record<string, unknown>;
  mlflow_run_id?: string;
  logs_path?: string;
}

export interface EvaluationJobResults {
  benchmarks: BenchmarkResult[];
  mlflow_experiment_url?: string;
}

export interface ModelRef {
  url: string;
  name: string;
}

export interface PassCriteria {
  threshold: number;
}

export interface BenchmarkConfig {
  id: string;
  provider_id: string;
  weight?: number;            // default 1
  primary_score?: PrimaryScore;
  pass_criteria?: PassCriteria;
  parameters?: Record<string, unknown>;
}

export interface PrimaryScore {
  metric: string;
  lower_is_better: boolean;
}

export interface CollectionRef {
  id: string;
}

export interface EvaluationJob {
  resource: EvaluationJobResource;
  status: EvaluationJobStatus;
  results?: EvaluationJobResults;
  model: ModelRef;
  pass_criteria?: PassCriteria;
  benchmarks: BenchmarkConfig[];
  collection?: CollectionRef;
  // UI-only derived fields (not from API)
  displayName?: string;       // set from user-provided name (stored in metadata or custom)
}
```

**State Transitions**:

```
[created] → pending → running → completed
                    ↘          ↘ failed
                      cancelled  (any state via DELETE)
```

- `pending`: Job accepted by Eval Hub, not yet dispatched to provider.
- `running`: At least one benchmark is being evaluated.
- `completed`: All benchmarks finished; results available.
- `failed`: One or more benchmarks errored and the overall job is terminal.
- `cancelled`: User-initiated cancellation via `DELETE /api/v1/evaluations/jobs/:id`.

---

### EvaluationCollection

Maps to `/api/v1/evaluations/collections`.

```typescript
export type CollectionType = 'system' | 'user';

export interface EvaluationCollection {
  resource: {
    id: string;
    tenant: string;
    created_at: string;
    updated_at: string;
  };
  type: CollectionType;
  name: string;
  description: string;
  tags: string[];             // e.g. ["General", "Healthcare", "Safety"]
  custom?: Record<string, unknown>;
  pass_criteria?: PassCriteria;
  benchmarks: BenchmarkConfig[];
}
```

**Validation Rules**:
- `name` MUST be non-empty when displayed in the collection card.
- `benchmarks.length` drives the "X benchmarks" count badge on the card.
- `tags` drives the Industry filter chips. If empty, collection is shown under "General".

---

### Benchmark

Maps to `/api/v1/evaluations/providers` → `benchmarks[]`.

```typescript
export interface Benchmark {
  id: string;
  provider_id: string;
  name: string;
  description: string;
  category: string;
  metrics: string[];
  num_few_shot?: number;
  dataset_size?: number;
  tags: string[];
}
```

---

### Provider

```typescript
export interface EvaluationProvider {
  id: string;
  name: string;
  description: string;
  type: string;
  benchmarks: Benchmark[];
}
```

---

### NewEvaluationFormValues (frontend-only)

Captures the wizard form state before submission.

```typescript
export interface NewEvaluationFormValues {
  evaluationName: string;           // required
  evaluationType: 'collection' | 'benchmark';
  selectedCollectionId?: string;    // required if type=collection
  selectedBenchmarkIds?: string[];  // required if type=benchmark (≥1)
  modelEndpointUrl: string;         // required
  modelName: string;                // required (displayed as "What was evaluated")
  apiKey?: string;                  // optional
  additionalArgsFile?: File;        // optional JSON upload
}
```

**Validation Rules**:
- `evaluationName`: non-empty, ≤ 255 chars.
- `modelEndpointUrl`: valid URL format (https:// or http://), non-empty.
- `selectedCollectionId` XOR `selectedBenchmarkIds` must be set (depending on type).
- `additionalArgsFile`: if provided, MUST be valid JSON (client-side parse check).

---

## 2. Go BFF Structs

The BFF uses generated or hand-written Go structs matching the Eval Hub OpenAPI schema.
Key types in `packages/eval-hub/bff/internal/integrations/evalhub/types.go`:

```go
// EvaluationJobResponse matches the /api/v1/evaluations/jobs response body
type EvaluationJobResponse struct {
    Resource   JobResource        `json:"resource"`
    Status     JobStatus          `json:"status"`
    Results    *JobResults        `json:"results,omitempty"`
    Model      ModelRef           `json:"model"`
    PassCriteria *PassCriteria    `json:"pass_criteria,omitempty"`
    Benchmarks []BenchmarkConfig  `json:"benchmarks"`
    Collection *CollectionRef     `json:"collection,omitempty"`
}

type JobResource struct {
    ID                 string     `json:"id"`
    Tenant             string     `json:"tenant"`
    CreatedAt          time.Time  `json:"created_at"`
    UpdatedAt          time.Time  `json:"updated_at"`
    MLflowExperimentID string     `json:"mlflow_experiment_id,omitempty"`
    Message            *Message   `json:"message,omitempty"`
}

type JobStatus struct {
    State      string              `json:"state"`
    Message    *Message            `json:"message,omitempty"`
    Benchmarks []BenchmarkStatus   `json:"benchmarks"`
}

type ListResponse[T any] struct {
    First      *HRef  `json:"first,omitempty"`
    Next       *HRef  `json:"next,omitempty"`
    Limit      int    `json:"limit"`
    TotalCount int    `json:"total_count"`
    Items      []T    `json:"items"`
}

type HRef struct {
    Href string `json:"href"`
}

type CreateEvaluationRequest struct {
    Model        ModelRef          `json:"model"`
    PassCriteria *PassCriteria     `json:"pass_criteria,omitempty"`
    Benchmarks   []BenchmarkConfig `json:"benchmarks"`
    Collection   *CollectionRef    `json:"collection,omitempty"`
    Custom       map[string]any    `json:"custom,omitempty"`
}

// Collection types
type Collection struct {
    Resource     CollectionResource `json:"resource"`
    Type         string             `json:"type"`
    Name         string             `json:"name"`
    Description  string             `json:"description"`
    Tags         []string           `json:"tags"`
    PassCriteria *PassCriteria      `json:"pass_criteria,omitempty"`
    Benchmarks   []BenchmarkConfig  `json:"benchmarks"`
}
```

---

## 3. BFF Client Interface

```go
// packages/eval-hub/bff/internal/integrations/evalhub/client.go

type EvalHubClient interface {
    // Evaluation Jobs
    ListEvaluations(ctx context.Context, limit, offset int, statusFilter string) (*ListResponse[EvaluationJobResponse], error)
    CreateEvaluation(ctx context.Context, req CreateEvaluationRequest) (*EvaluationJobResponse, error)
    GetEvaluation(ctx context.Context, id string) (*EvaluationJobResponse, error)
    CancelEvaluation(ctx context.Context, id string) error

    // Collections
    ListCollections(ctx context.Context) (*ListResponse[Collection], error)
    GetCollection(ctx context.Context, id string) (*Collection, error)

    // Providers & Benchmarks
    ListProviders(ctx context.Context, includeBenchmarks bool) (*ProvidersResponse, error)

    // Health
    Health(ctx context.Context) (*HealthResponse, error)
}
```

---

## 4. API Pagination Model

The Eval Hub list endpoints return HAL-style pagination:

```json
{
  "first": { "href": "..." },
  "next":  { "href": "..." },
  "limit": 50,
  "total_count": 237,
  "items": [...]
}
```

The BFF passes this structure through unchanged to the frontend, which uses `total_count`
and `limit` to render PatternFly `Pagination` controls. The frontend sends `limit` and
`offset` as query params to the BFF, which forwards them to Eval Hub.

