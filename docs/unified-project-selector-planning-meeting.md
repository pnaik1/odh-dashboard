# Unified Project Selector Planning Questions

## Purpose

Use this document in the architecture and senior-review meeting to agree on the smallest safe
first step for the Unified Project Selector (UPS).

## Proposed First Passes

These are proposals for discussion, not decisions.

| Area | Small proof |
| --- | --- |
| RHOAI | Training Jobs, using `/develop-train/training-jobs/:namespace` |
| RHOAI | Workload Metrics, using `/observe-monitor/workload-metrics/<tab>/:namespace` |

## What We Need To Agree On

1. **First features**
   - Are Training Jobs and Workload Metrics the right small first passes?
   - Does Training Jobs need an explicit decision in the epic because it was not one of its named
     examples?

2. **One active project**
   - Can the masthead and the selected feature read one shared active project?
   - When UPS is enabled, should the feature's existing project selector be hidden rather than kept
     as a second source of state?

3. **URL and bookmarks**
   - Each feature has its own URL shape. Can each feature read its own namespace from its route,
     while shared UPS validates and stores the resulting active project?
   - If a bookmarked namespace is invalid or inaccessible, should the first pass show an error or
     replace the URL with a fallback project?

4. **Feature gate**
   - Which existing development feature-flag mechanism should control UPS?
   - Who approves enabling it and who owns rollback?

5. **Project changes**
   - What must each selected feature reset or cancel when the active project changes so old data is
     never displayed or submitted?

## Not In The First Pass

- Migrating more RHOAI feature areas.
- Manual namespace entry and exact namespace lookup.
- Core BFF SSAR endpoint implementation.
- General endpoint cleanup or production rollout.

## Decisions To Leave With

- [ ] Approved the first RHOAI proof features: Training Jobs and Workload Metrics.
- [ ] Agreed ownership boundary: feature reads/builds its own route; UPS owns active selection.
- [ ] Agreed invalid-bookmark behavior.
- [ ] Agreed UPS feature gate and rollback owner.
- [ ] Named next implementation tickets.

## References

- [UPS Strategy Handbook](unified-project-selector-strategy-handbook.md)
- [Phase 1 Delivery Plan](unified-project-selector-phase-1.md)
