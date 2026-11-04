# Campaigns CRUD (frontend) Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement with `tlc-spec-driven` Execute: one task → gate → atomic commit → mark `[x]` in this file in same commit. Sub-agent model: **composer-2.5-fast** per `.cursor/agents.md`. **Depends on backend T4** for live API (mock in unit tests until then).

**Spec**: `.specs/features/campaigns/spec.md`
**Context**: `.specs/features/campaigns/context.md`

---

## Test Coverage Matrix

> Guidelines: `package.json` (`npm test`, `npm run build`). Vitest + Testing Library co-located `*.test.tsx`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| API client | unit | POST/PATCH/GET paths + ApiError | `src/api/campaigns.test.ts` | `npm test -- src/api/campaigns.test.ts` |
| Routes / links | unit | redirect, Home/result hrefs | `src/App.tsx`, `*Page.test.tsx` | `npm test -- --run` |
| Sidebar | unit | Campanhas link + active state | `src/layout/Sidebar.test.tsx` | `npm test -- src/layout/Sidebar.test.tsx` |
| Campaigns page | unit | list, create, edit, disabled area | `src/pages/CampaignsPage.test.tsx` | `npm test -- src/pages/CampaignsPage.test.tsx` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Single file tests | `npm test -- --run <path>` |
| Full | After page/routing tasks | `npm test -- --run` |
| Build | Phase end | `npm test -- --run; npm run build` |

---

## Execution Plan

### Phase 1: Client and routing

```
T1 → T2
```

### Phase 2: UI

```
T2 → T3 → T4 → T5 → T6
```

---

## Task Breakdown

### T1: Campaign API client CRUD methods

**What**: Add `createCampaign`, `updateCampaign`, `getCampaign` with typed bodies; preserve `ApiError` detail.
**Where**: `src/api/campaigns.ts`, `src/api/campaigns.test.ts`
**Depends on**: backend POST/PATCH/GET (mock fetch in tests)
**Requirement**: CAMPF-04

**Done when**:

- [x] Tests assert URLs and methods `/api/campaigns`, PATCH, GET by id
- [x] Gate: `npm test -- --run src/api/campaigns.test.ts`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(campaigns): add create update get API client`

---

### T2: Routes and deep links

**What**: Register `/campaigns`, `/campaigns/:id`; redirect `/campanhas/:id` → `/campaigns/:id`; update Home + ResultadoMetricsTab links; update affected tests (CampanhaPage, Home, Resultado).
**Where**: `src/App.tsx`, `src/pages/HomePage.tsx`, `src/pages/resultado/ResultadoMetricsTab.tsx`, related tests
**Depends on**: T1
**Requirement**: CAMPF-03

**Done when**:

- [x] No new links to `/campanhas/*`
- [x] Gate: `npm test -- --run src/pages/HomePage.test.tsx src/pages/CampanhaPage.test.tsx src/pages/resultado/ResultadoMetricsTab.test.tsx`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(campaigns): migrate routes to /campaigns prefix`

---

### T3: Sidebar Campanhas entry

**What**: Add nav item "Campanhas" → `/campaigns`; active on `/campaigns` and `/campaigns/:id`. Reuse existing icon asset pattern (e.g. icoGrid or similar from `src/assets`).
**Where**: `src/layout/Sidebar.tsx`, `src/layout/Sidebar.test.tsx`
**Depends on**: T2
**Requirement**: CAMPF-01

**Done when**:

- [x] Sidebar test includes Campanhas href `/campaigns`
- [x] Gate: `npm test -- --run src/layout/Sidebar.test.tsx`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(campaigns): add Campanhas sidebar link`

---

### T4: Campaigns list page

**What**: New `CampaignsPage` at `/campaigns`: load list, empty state, error/retry, row actions (edit, open map → `/campaigns/:id`). Table with name, count, simulated badge.
**Where**: `src/pages/CampaignsPage.tsx`, `src/pages/CampaignsPage.test.tsx`, wire route in `App.tsx`
**Depends on**: T3
**Reuses**: HistoricoPage layout patterns (px-9 py-8, table styling)
**Requirement**: CAMPF-02 (list portion)

**Done when**:

- [x] Tests cover list render, empty state, navigate to map
- [x] Gate: `npm test -- --run src/pages/CampaignsPage.test.tsx`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(campaigns): add campaigns list page`

---

### T5: Create and edit form modal

**What**: Modal/slide-over on CampaignsPage: create (POST), edit (PATCH); disable area fields when `analyses_count > 0`; client validation for coords; show API `detail` on error.
**Where**: `src/pages/CampaignsPage.tsx`, extend tests
**Depends on**: T4
**Requirement**: CAMPF-02, CAMPF-05

**Done when**:

- [x] Tests: create calls POST; edit with count>0 PATCH without area change; 409 shows message
- [x] Gate: `npm test -- --run; npm run build`

**Tests**: unit
**Gate**: build
**Commit**: `feat(campaigns): add campaign create and edit forms`

---

### T6: Traceability

**What**: Mark all tasks complete; update spec traceability statuses.
**Where**: `.specs/features/campaigns/tasks.md`, `spec.md`
**Depends on**: T5

**Done when**:

- [x] All tasks `[x]`; build gate passes
- [x] Gate: `npm test -- --run; npm run build`

**Tests**: n/a
**Gate**: build
**Commit**: `chore(campaigns): complete frontend tasks traceability`

---

## Requirement Traceability (tasks)

| Requirement ID | Tasks |
| --- | --- |
| CAMPF-01 | T3 |
| CAMPF-02 | T4, T5 |
| CAMPF-03 | T2 |
| CAMPF-04 | T1 |
| CAMPF-05 | T5 |
