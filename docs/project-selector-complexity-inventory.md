# Project Selector Complexity Inventory

## Purpose

Use this inventory to choose Unified Project Selector (UPS) migration slices. Complexity means the
effort to replace a page-level selector with the shared masthead active-project model; it does not
measure feature size.

## Ranking Factors

- **Route shape:** one path namespace is simpler than query parameters, multiple route variants, or
  no canonical namespace route.
- **State:** independent persistence or multiple project sources increases complexity.
- **Lifecycle:** project-scoped providers, watches, caches, forms, and mutations must not retain
  stale data after a switch.
- **Boundary:** Module Federation, distribution, or upstream-package boundaries add coordination.
- **Domain identity:** a selector for something other than a Kubernetes namespace is not a direct
  UPS migration candidate.

## Persistent Page-Level Selectors

These selectors establish the project/namespace used by a page or route and are candidates for a
later shared working-project migration.

| Rank | Area | UPS status | Complexity | Why |
| ---: | --- | --- | --- | --- |
| 1 | Model Training / Training Jobs | **Recommended first RHOAI slice** | Low | One namespace path parameter, one project-scoped provider, host-bundled package, and a clear existing page selector. Its All Projects behavior remains outside the first gated path. |
| 2 | Distributed Workloads | Later RHOAI target | Medium | A path namespace and one selector, but switching affects metrics polling and distributed-workloads context in addition to route state. |
| 3 | Pipelines | Epic candidate; later target | Medium-high | Reusable loader pattern, but project changes recreate KFP and MLMD data paths. Related MLflow pages also use a workspace query form. |
| 4 | RHOAI Model Serving Global Deployments | Epic candidate; later target | High | Project-scoped provider plus route canonicalization and multiple deployment route forms. Global pages can also represent all projects. |
| 5 | RHAII/xKS Model Serving Global Deployments | Thin RHAII/xKS proof | High | Includes Model Serving route complexity plus RHAII list-backed namespaces and a federated remote boundary. It is a proof after the RHOAI shared contract works, not an easy first migration. |
| 6 | Gen AI | Later package migration | Medium-high | Simple route shape, but it owns namespace persistence independently of host `ProjectsContext`. |
| 7 | Eval Hub | Later package migration | Medium-high | Independent namespace persistence plus a namespace-scoped collections provider. |
| 8 | AutoML | Later package migration | Medium-high | Own namespace persistence and route redirects; it explicitly resets list UI state on namespace change to avoid stale display. |
| 9 | AutoRAG | Later package migration | Medium-high | Same independent selector and stale-state concerns as AutoML. |
| 10 | Agent Ops | Later package migration | High | Project choices are derived through a bridge/effective-namespace hook with feature-specific error handling. |
| 11 | Embedded MLflow workspace pages | Part of Pipelines/MLflow follow-up, not an independent first target | High | Uses `workspace` query state and reuses Pipelines selector infrastructure. Treat it as a Pipelines route-adapter follow-up. |
| 12 | Data Connect Hub | Later package migration | High | Resolves URL, preferred namespace, and fallback itself, then canonicalizes `?project=`. It uses a separate `mod-arch-core` namespace provider. |
| 13 | Data Registry | Later package migration | High | Similar independent query/persistence resolution, plus selected-project data loading and project-creation/retry flows. |
| 14 | MaaS external models/providers | **Explicitly out of current UPS scope** | Very high | The roadmap excludes MaaS integration. It also has competing host and `mod-arch-core` namespace sources caused by Module Federation context boundaries. |
| 15 | Feature Store | **Not a UPS target without product decision** | Very high / separate | It selects a FeatureStore/Feast domain project, not automatically the Kubernetes working namespace. |

## RHOAI First-Pass Recommendation

Choose **Model Training / Training Jobs** first.

- It is the lowest-complexity RHOAI page-level selector found.
- Its namespace is a single route parameter.
- The existing loader already validates the route namespace and mounts one namespace-scoped context.
- It avoids a Module Federation or separate-distribution dependency in the first delivery.

Use **RHAII/xKS Model Serving Global Deployments** only as a thin follow-up proof, not as an equally
small migration. Keep it list-backed initially; exact manual namespace lookup is separate work.

## Not Yet Ranked: RHOAI-Hosted Notebooks

Notebooks is an Epic 2 candidate, but this inventory did not find an equivalent standalone page-level
namespace selector in the package. Its working project is supplied through RHOAI host route/location
data and upstream workbench lifecycle. Rank it only after the Notebooks owner confirms the route,
ownership boundary, and project-change behavior.

## Form And Wizard Selectors: Do Not Migrate To UPS

The following are selectors used to choose a project for a specific create, deploy, register, or
configuration operation. They must remain local form state because a user may intentionally choose
a target project that differs from the dashboard's active working project.

| Area | Examples | Reason to keep local |
| --- | --- | --- |
| Model Serving | Deployment wizard, preconfigure step, model-registry deployment modal | Target project is part of the deployment form and may require independent validation. |
| Model Registry | Project selector field | A field in registry workflows, not a global page context. |
| MLflow | MCP registration project selector extension | A host-provided form field for a specific action. |
| Agent Ops | Deployment wizard project field | Target project is selected for agent deployment. |
| MCP catalog and register flows | Project selector controls in modals | Operation-specific destination, not a route-level working project. |

The masthead active project may be offered as a default value for these forms, but it must not
replace the form field or force the form to follow later masthead changes.

## Not Ranked As Page Selectors

- `ProjectsContextProvider` implementations in RHOAI and RHAII/xKS are project-data providers,
  not user-facing selectors.
- The shared `ProjectSelector`, `ProjectSelectorNavigator`, and `ProjectsRoutes` components are
  infrastructure used by multiple areas, not migration targets themselves.
- No equivalent standalone global selector was identified in the Notebooks package during this
  inventory. Notebook project selection should be evaluated through its RHOAI host route and
  workbench lifecycle before ranking it.

## Meeting Questions

1. Confirm Training Jobs as the RHOAI first pass.
2. Confirm whether the RHAII Model Serving proof should be part of the same phase or follow once
   the RHOAI contract is working.
3. Confirm that Feature Store selection is out of scope for UPS unless its project identity is
   explicitly aligned with Kubernetes namespace identity.
4. Confirm that wizard and form selectors stay local and only optionally default from UPS.
