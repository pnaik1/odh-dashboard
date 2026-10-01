# Unified Project Selector — Phase 1 Delivery Plan

## Purpose

Deliver a development-gated proof of the unified working-project selector across two RHOAI
feature areas and one RHAII/xKS shell integration. This phase reuses the existing `ui-core`
selector and legacy `ProjectsContext`; it does not migrate every project-aware surface.

## Phase 1 scope

### Shared foundation

- Add a lightweight, platform-neutral working-project context in `packages/ui-core` alongside the
  existing `ProjectsContext`.
- Keep the contract independent of OpenShift `ProjectKind`, Core BFF response DTOs, route shapes,
  and distribution runtime behavior.
- Adapt RHOAI's existing watched-project source through the host provider rather than changing the
  data source in this phase.
- Mount RHOAI project providers above the PatternFly `Page` so masthead and routes share the same
  project state.
- Add a development-only Unified Project Selector (UPS) gate. With the gate disabled, current
  customer-facing selector behavior remains unchanged.

### RHOAI feature slice 1: Training Jobs

**Code locations**

- `packages/model-training/src/ModelTrainingRoutes.tsx`
- `packages/model-training/src/global/ModelTrainingCoreLoader.tsx`
- `packages/model-training/src/components/ModelTrainingProjectSelector.tsx`
- `packages/model-training/src/global/ModelTrainingContext.tsx`

**Current behavior**

- Uses an optional `:namespace` route segment under `/develop-train/training-jobs`.
- Redirects a namespace-less route using stored preferred project or current preferred project.
- Supports an existing All Projects route when no preferred selection exists.
- Renders `ModelTrainingProjectSelector`, which wraps `ProjectSelectorNavigator`, in the page
  header for empty and invalid-project states.
- Loads namespace-scoped TrainJob and RayJob watches through `ModelTrainingContextProvider`.

**Phase 1 change behind UPS gate**

- Render no page-level working-project selector.
- Use masthead selection to navigate to `/develop-train/training-jobs/<namespace>`.
- Preserve training-job list, details drawer, logs, pod, resource, pause/resume, and node-scaling
  behavior after navigation.
- Keep the existing All Projects behavior outside the unified-selector path until its product
  behavior is explicitly reconciled with the later migration scope.
- Preserve missing and invalid namespace behavior until shared fallback behavior replaces it.
- Ensure this surface never renders both masthead and legacy working-project selectors while UPS
  gate is enabled.

### RHOAI feature slice 2: GPUaaS Infrastructure compatibility proof

**Code locations**

- `packages/gpuaas/extensions.ts`
- `packages/gpuaas/src/InfrastructureRoutes.tsx`
- `packages/gpuaas/src/pages/InfrastructurePage.tsx`
- `packages/gpuaas/src/const.ts`

**Current behavior**

- Is cluster/cohort-oriented infrastructure monitoring at
  `/observe-and-monitor/infrastructure`, not a working-project page.
- Has no `ProjectsContext` or `ProjectSelectorNavigator` consumer.
- Shows different tabs by user access: cluster administrators can access utilization and quota
  usage; project administrators see workloads.
- Reads cross-project Kueue workload and cluster-queue data; a masthead working-project selection
  must not silently filter, redirect, or reinterpret those views.

**Phase 1 change behind UPS gate**

- Render the gated masthead selector while GPUaaS is active and verify the GPUaaS route continues
  to work unchanged.
- Confirm changing the working project does not change the GPUaaS route, selected cohort, visible
  tabs, workload aggregation, or RBAC behavior.
- Do not add a page-level project selector or a project-route adapter to GPUaaS.
- Record any demonstrated dependency on working-project state as follow-up work; no dependency is
  assumed by this phase.

### RHAII/xKS thin proof

**Code locations**

- `distributions/rhaii/src/bootstrap.tsx`
- `distributions/rhaii/src/context/RhaiiAppProvider.tsx`
- `distributions/rhaii/src/context/ProjectsContextProvider.tsx`
- `distributions/base/src/createDistribution.tsx`
- `distributions/base/src/ShellHeader.tsx`

**Phase 1 proof**

- Provide the same lightweight working-project contract through `RhaiiAppProvider`.
- Mount a gated masthead selector using the base-shell masthead composition point.
- Confirm existing list-backed RHAII namespace data can populate the selector.
- Confirm an RHAII-hosted consumer receives selection updates through the shared context.

**Deferred xKS behavior**

- List-forbidden/manual namespace text entry.
- `GET /api/v1/namespaces/:namespace` implementation.
- Caller-token `SelfSubjectAccessReview` authorization.
- `403 Forbidden` inline validation behavior.
- Persisting and revalidating manually entered namespaces.

These are owned by the later xKS workstream after the Core BFF contract defined in
`RHOAIENG-95641` is implemented.

## Masthead and provider integration points

| Distribution | Provider/composition point                                              | Masthead point                                                       |
| ------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| RHOAI        | `frontend/src/app/App.tsx`                                              | `frontend/src/app/Header.tsx` and `frontend/src/app/HeaderTools.tsx` |
| RHAII/xKS    | `distributions/rhaii/src/context/RhaiiAppProvider.tsx` via `AppWrapper` | `distributions/base/src/ShellHeader.tsx`                             |

RHOAI currently mounts `ProjectsContextProvider` inside the `Page` content tree. Phase 1 must
move the applicable provider boundary above `Page` so `Header` can consume project state. RHAII's
`AppWrapper` already surrounds the full base shell, including `ShellHeader` and routes.

## Required shared behavior

1. A valid project from the incoming URL takes precedence over browser-stored selection.
2. A valid stored project applies when the URL has no project.
3. With neither source, select deterministically: first AI project in ascending alphanumeric
   order, then first accessible project in ascending alphanumeric order.
4. Changing project updates shared working-project state and each migrated page's route through
   its route adapter.
5. Existing source-compatible `ProjectsContext` consumers remain functional during migration.
6. When UPS gate is disabled, migrated surfaces retain existing legacy selector behavior.

## Explicit exclusions

- Model Serving and Pipelines migration, including their current page-level All Projects behavior.
- Forms and wizard read-only project treatment or cancel semantics.
- Broad migration of remaining RHOAI or xKS surfaces.
- MaaS Consumer Portal integration.
- Core BFF endpoint cleanup not required by this phase.
- Model Registry, Notebooks, standalone Kubeflow, and `mod-arch-core` changes unless a proven
  compatibility conflict requires follow-up work.

## Test plan

### Shared/unit coverage

- `ui-core`: lightweight context state, selection precedence, deterministic fallback, and
  provider-absent behavior.
- RHOAI adapter: mapping watched projects, synchronization to legacy preferred project, stale or
  removed project handling, and gate-disabled compatibility.
- Route adapters: path namespace precedence, approved query namespace behavior, and redirect
  generation for both RHOAI slices.

### RHOAI integration and Cypress coverage

- Masthead selector is visible only when the UPS development gate is enabled.
- Training Jobs: choosing a project updates the namespace URL to
  `/develop-train/training-jobs/<namespace>` and loads only that namespace's TrainJob/RayJob data.
- Training Jobs: no duplicate masthead and page-level working-project selectors when the UPS gate
  is enabled.
- GPUaaS: selector visibility and selection changes do not alter infrastructure route, cohort,
  cross-project workload aggregation, or access-controlled tab visibility.
- Existing feature Cypress tests remain in their owning package. Extend
  `packages/cypress/cypress/tests/mocked/modelTraining/` and
  `packages/cypress/cypress/tests/mocked/gpuaas/infrastructure.cy.ts` for these flows.

### RHAII/xKS coverage

- `RhaiiAppProvider` provides list-backed namespaces to the lightweight contract.
- Base shell masthead renders the gated selector.
- Selecting a namespace updates a consumer under the same provider tree.
- Preserve existing list-fetch timeout and error behavior.

## Completion criteria

Phase 1 is complete when development-gated RHOAI masthead selection drives Training Jobs without
a duplicate page selector, GPUaaS proves it remains unchanged as a cluster/cohort-scoped
compatibility surface, and RHAII/xKS proves the same shared contract can be mounted through its
separate base-shell masthead path. The gate remains disabled for normal customer-facing behavior
until later migration and release-hardening work completes.
