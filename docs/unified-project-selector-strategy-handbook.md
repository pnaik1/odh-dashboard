# Unified Project Selector Strategy Handbook

## Purpose

Use this handbook to plan, implement, review, and release the Unified Project Selector (UPS).
UPS establishes one shared active working project for dashboard surfaces instead of independent
page-level selectors and project state.

This handbook consolidates the delivery intent in RHOAIENG-95509, RHOAIENG-95641,
RHOAIENG-95808, and RHOAIENG-95809. The related
[Phase 1 delivery plan](unified-project-selector-phase-1.md) is an implementation proposal, not
the source of approval for unresolved product-slice choices.

## Strategy At A Glance

| Goal | Strategy |
| --- | --- |
| One current project | The masthead owns the active working-project state; migrated pages consume it. |
| Preserve existing behavior | Put the work behind a development-only UPS gate until migration and release criteria are met. |
| Avoid platform coupling | Keep the shared UI contract independent of OpenShift watches, Core BFF DTOs, routes, and distributions. |
| Migrate safely | Adapt existing RHOAI watched projects first; migrate one representative RHOAI surface before broad adoption. |
| Support restricted Kubernetes users | Use a server-validated exact namespace lookup when namespace listing is forbidden. |
| Protect user data | Reset, remount, or cancel project-scoped work on selection changes so stale data cannot be shown or submitted. |

## Delivery Sequence

```text
API/RBAC investigation ──► shared foundation ──► RHOAI vertical slice and xKS proof ──► xKS completion
RHOAIENG-95641              RHOAIENG-95509        RHOAIENG-95808                    RHOAIENG-95809
```

### 1. Core BFF API and RBAC decision

The completed investigation defines the later hosted namespace API:

- `GET /api/v1/namespaces` is the intended authoritative namespace-list API.
- `GET /api/v1/namespaces/:namespace` validates one exact Kubernetes namespace name.
- The exact lookup performs a caller-token `SelfSubjectAccessReview` for `get` on that named
  Namespace resource.
- A permitted lookup returns one namespace comparable to an item from the list response.
- A denied lookup returns `403 Forbidden`; the client retains its current selection and displays
  an inline error.
- Do not infer namespace access from Services, KServe, service accounts, or unrelated permissions.

The investigation does not require this API to be implemented before the RHOAI adapter foundation.

### 2. Shared foundation

Deliver a small shared contract and resolver around the existing `ui-core` selector:

- Define explicit states for loading, empty accessible list, provider absent, provider failure,
  stale/removed selection, and list unavailable or forbidden.
- Use Kubernetes namespace resource name as the identity for URLs and persistence. Treat display
  name as presentation-only.
- Adapt the existing RHOAI watched-project source instead of replacing it immediately.
- Place the provider above the RHOAI masthead and routes so they share one state source.
- Keep existing `ProjectsContext` consumers working during migration.

### 3. First vertical slice

Put the existing selector in the RHOAI `HeaderTools` masthead location behind the UPS gate and
connect it to one representative RHOAI-hosted project-aware product area. Also prove that the
same contract can render through the RHAII/xKS base-shell masthead path.

The selected RHOAI area must demonstrate project-aware navigation, project-scoped data reload,
stale-data prevention, and a reusable route/lifecycle pattern. It must not introduce another
working-project selector or mutable source of project state in the gated path.

### 4. xKS-specific completion

When a user cannot list namespaces:

- Distinguish that condition from an empty accessible namespace list.
- Allow exact namespace-name entry.
- Validate the name through the Core BFF exact-lookup endpoint.
- Persist only successful validations.
- Revalidate a stored manual selection before restoring it.

Do not use this workstream as a reason to migrate every xKS product surface, wizard, or form.

## Selection And Navigation Contract

Resolve the active project in this order:

1. Use a valid project explicitly represented in the current URL.
2. If there is no valid URL project, restore a valid browser-stored project.
3. If neither exists, choose the first AI project; otherwise choose the first accessible project.

Apply the same case-insensitive, numeric-aware ascending sort for the selector and fallback
resolver. Use resource name as the deterministic tie-breaker.

| Event | Required behavior |
| --- | --- |
| Explicit selector change | Use the selected surface's route builder and browser-history `push`. |
| Restore, canonicalize, or fallback | Use browser-history `replace`. |
| Invalid or inaccessible deep link | Do not activate it or overwrite stored selection. |
| Reload or Back/Forward | Reconcile URL, shared state, and storage without redirect loops. |
| Project removed or access lost | Invalidate the selection and resolve again without retaining stale access. |
| Normal dashboard tabs | Synchronize validated storage updates without accepting an invalid selection. |

## Route-To-Project Architecture

### Ownership

| Layer | Owns | Must not own |
| --- | --- | --- |
| Feature route adapter | Its authoritative URL namespace location and the canonical URL to build for a selected namespace | Global project state, browser persistence, provider data acquisition, or RBAC decisions |
| Shared resolver/provider | URL-versus-storage precedence, validation, active-project state, fallback, persistence, and cross-tab synchronization | Feature-specific path shapes or query-parameter names |
| Host source adapter | Conversion of watched projects or BFF namespace responses into the shared project model | Route parsing or feature navigation |
| Masthead selector | Displaying the active project and requesting a project change | Parsing routes or deciding authorization |

### Route adapter contract

Each migrated project-scoped feature exports an adapter owned by that feature. The namespace value
returned by `readUrlProjectName` is always a Kubernetes namespace resource name.

```ts
interface WorkingProjectRouteAdapter {
  /** Returns this feature's one authoritative namespace from the current location. */
  readUrlProjectName: () => string | undefined;

  /** Creates this feature's canonical location for a validated namespace. */
  buildProjectLocation: (projectName: string) => string;

  /** False for intentionally cluster-scoped pages. */
  usesWorkingProject: boolean;
}
```

Examples:

| Feature URL shape | `readUrlProjectName` | `buildProjectLocation('team-a')` |
| --- | --- | --- |
| `/develop-train/training-jobs/:namespace` | Read `:namespace`. | `/develop-train/training-jobs/team-a` |
| `/feature?project=:namespace` | Read query parameter `project`. | `/feature?project=team-a` |
| Cluster-scoped infrastructure page | Return `undefined`; `usesWorkingProject` is `false`. | Do not change the location. |

### Initial navigation from a bookmark

```text
1. Router matches the feature route.
2. The feature route adapter extracts its authoritative namespace, if present.
3. It provides that value to the shared resolver as URL intent.
4. The resolver waits for provider data, then validates the intent.
   - RHOAI: find the name in the existing watched-project adapter result.
   - Restricted xKS: validate the exact name through Core BFF lookup and caller-token SSAR.
5. If valid, publish it as the active project and persist the validated name.
6. If invalid, forbidden, or missing, do not activate or persist it. Apply the approved error or
   fallback behavior without creating a navigation loop.
7. Masthead and feature content consume the same resolved active project.
```

Do not restore storage or choose fallback while a URL namespace is awaiting validation. That avoids
a bookmarked project briefly switching to a stored or fallback project before the provider loads.

### Explicit selector change

```text
1. User chooses a namespace in the masthead selector.
2. Shared resolver validates and records the selection.
3. The current project-scoped feature's route adapter builds its destination.
4. Navigate with history push.
5. The route re-renders from the new namespace and resets, remounts, or cancels old scoped work.
```

For restoration, fallback, or URL canonicalization, use history `replace`, not `push`.

### Conflicting values and non-project routes

- A feature must define one authoritative namespace location. If a legacy URL contains more than
  one candidate value, the adapter reads only the authoritative value and removes or normalizes
  conflicting values with `replace` after validation.
- A cluster-scoped feature does not submit URL project intent and does not navigate when the
  masthead selection changes. It may still display the shared selection for consistency.
- Project-details navigation is not a selector change and must not overwrite the active working
  project unless the feature explicitly defines it as its authoritative working-project route.

## Distribution Integration Boundaries

| Distribution | Current composition point | Strategy requirement |
| --- | --- | --- |
| RHOAI | `frontend/src/app/HeaderTools.tsx` and the application provider tree | Make the shared provider available to both masthead and routes; source it initially from the existing watched-project list. |
| RHAII/xKS | `distributions/rhaii/src/context/RhaiiAppProvider.tsx` and `distributions/base/src/ShellHeader.tsx` | Feed the same shared contract from RHAII project data and prove masthead/provider rendering before xKS manual lookup is completed. |

## Non-Negotiable Guardrails

- Reuse the existing `ui-core` selector. Do not create a second selector UI.
- Do not widen namespace visibility to make selection easier.
- Keep the shared contract independent from a provider's backend response shape.
- Keep the UPS gate disabled by default until the approved release decision.
- Do not let a project change display or submit data from the previous project.
- Keep project-details navigation distinct from changing the active working project.
- Retain package-specific namespace endpoints until their callers and standalone replacements are
  explicitly planned; broad endpoint cleanup is not a prerequisite.

## Open Decisions

The following questions need an explicit owner and recorded decision before the affected work is
considered implementation-ready.

| Decision | Why it is open | Required outcome |
| --- | --- | --- |
| First RHOAI vertical-slice area | The epic names Pipelines, Model Serving, and RHOAI-hosted Notebooks as candidates. The Phase 1 draft instead proposes Training Jobs plus a GPUaaS compatibility proof. | Select one product-aware surface, identify its owner, and document why its route and lifecycle pattern is representative. Confirm whether Training Jobs supersedes the epic candidates or remains a separate proposal. |
| Role of GPUaaS | The draft uses GPUaaS as a non-project-scoped compatibility proof; the epic requires one project-aware end-to-end slice. | Confirm that GPUaaS is supplementary validation only and cannot substitute for the selected project-aware slice. |
| UPS gate design and ownership | The desired gate behavior is defined, but its flag name, configuration source, default, and removal/release process are not. | Choose the existing feature-flag mechanism, document enablement scope, and define release approval and rollback ownership. |
| Shared contract API | The required behaviors are known, but the exact TypeScript interfaces, provider status values, actions, and error payloads are not yet recorded here. | Approve the `ui-core` public contract, including all distinct unavailable/empty/error/stale states and migration compatibility with `ProjectsContext`. |
| Route-adapter convention | Each migrated surface needs a route builder, but the shared adapter interface and treatment of legacy all-project routes are not settled. | Define adapter inputs/outputs, URL parameter conventions, and whether a surface can opt out because it is cluster-scoped. |
| Persistence scope | Browser storage is required, but storage key/version, validation timing, migration from legacy preference, and cross-tab event policy remain unspecified. | Specify storage schema, validation rules, legacy migration, and behavior for malformed or stale values. |
| First-slice stale-work policy | The outcome is required, but each candidate surface may need reset, remount, abort, or cache invalidation. | Record the surface-specific lifecycle plan and tests for in-flight reads and submissions. |
| RHAII proof consumer | The roadmap asks for a thin masthead/provider proof without naming the consumer. | Choose a RHAII-hosted consumer that demonstrates selection propagation without prematurely requiring manual lookup. |
| Core BFF implementation ticketing | The investigation is complete, but endpoint implementation, OpenAPI changes, and ownership are later work. | Create and link implementation work for OpenAPI, list endpoint, exact lookup, SSAR, auth tests, and frontend integration. |
| xKS manual-entry UX | Required behavior is stated, but validation timing, input constraints, accessibility copy, retry behavior, and loading presentation are not. | Approve UX behavior for unavailable listing, successful lookup, `403`, network errors, reload, and stale stored values. |
| Release success metrics | The tickets require tests but do not define rollout telemetry or an operational success threshold. | Define gate adoption scope, error signals, rollback triggers, and approval criteria for enabling UPS beyond development. |

## Implementation Readiness Checklist

Before starting a child story, confirm all applicable items:

- [ ] The story identifies its delivery phase and dependency tickets.
- [ ] The selected surface is classified as project-scoped, cluster-scoped, or a compatibility-only proof.
- [ ] The shared provider contract, source adapter, and route adapter boundaries are named.
- [ ] URL, storage, fallback, and browser-history behavior are defined for the surface.
- [ ] The UPS gate's disabled behavior preserves the existing customer path.
- [ ] State handling covers loading, empty, unavailable, error, stale, and removed-project cases.
- [ ] The stale-data policy covers reads, writes, forms, drawers, and in-flight requests that apply.
- [ ] RBAC behavior is specified; xKS work uses exact-name SSAR validation rather than inferred access.
- [ ] Unit, integration, and Cypress coverage are assigned to the owning package or distribution.
- [ ] A migration/rollback owner is identified.

## Validation Matrix

| Area | Minimum proof |
| --- | --- |
| Shared resolver | URL precedence, stored restoration, deterministic fallback, invalid URL handling, provider absent, and removed selection. |
| Browser behavior | Reload, Back/Forward, canonicalization, cross-tab synchronization, and no feedback loops. |
| RHOAI masthead | Selector appears only with the UPS gate enabled and shares provider state with a migrated route. |
| Selected RHOAI surface | Selection updates the approved route, refreshes scoped data, and prevents stale display or submission. |
| Legacy compatibility | Gate-disabled behavior preserves the legacy selector and project flow. |
| RHAII/xKS proof | The base-shell masthead receives list-backed selections and a consumer observes updates. |
| xKS restricted access | List allowed, list forbidden, exact lookup allowed, exact lookup denied with `403`, unchanged selection on failure, stale stored value, and reload. |
| Backend authorization | Caller-token SSAR checks `get` on the exact named Namespace and does not use unrelated permission proxies. |

## Completion Criteria

The strategy is ready to move beyond development-gated delivery when:

- The shared contract and RHOAI adapter are integrated above the masthead and routes.
- One approved RHOAI project-aware area consumes only the shared active project in the gated path.
- The selected area has verified routing, reload, browser navigation, cross-tab, and stale-data behavior.
- The RHAII/xKS masthead/provider seam has been proven.
- The later Core BFF and xKS restricted-listing work has separate, owned implementation scope.
- The team has an approved release, rollback, and observability decision for the UPS gate.
