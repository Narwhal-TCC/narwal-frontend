# Campaign Map (frontend) Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `narwal-backend/.design/campaign-map.md`
**Spec**: `.specs/features/campaign-map/spec.md`
**Prerequisite**: backend tasks T1-T10 merged (API contract available)
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `package.json` (`vitest run`, `tsc -b && vite build`). No lint script, no coverage threshold - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| API client (`src/api`) | unit | request shape per call, incl. omitted fields | `src/api/*.test.ts` | `npm test` |
| Upload helpers (`src/upload`) | unit | dedupe key covers new fields | `src/upload/*.test.ts` | `npm test` |
| Domain (`src/domain`) | unit | all branches, 1:1 to map ACs | `src/domain/*.test.ts` | `npm test` |
| Component / page | unit (RTL, `react-leaflet` mocked) | every spec AC for that screen, incl. empty and error states | `src/**/*.test.tsx` | `npm test` |
| Dependencies / config | none | build gate only | - | `npm run build` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests | `npm test` |
| Full | Same as quick (no e2e suite) | `npm test` |
| Build | Dependency tasks and phase completion | `npm run build; npm test` |

---

## Execution Plan

### Phase 1: Client

```
T1 → T2 → T3 → T4
```

### Phase 2: Upload and result

```
T5 → T6 → T7
```

### Phase 3: Map and Home

```
T8 → T9 → T10 → T11
```

---

## Task Breakdown

### T1: Add map dependencies

**What**: Add `leaflet`, `react-leaflet`, `leaflet.heat`, `@types/leaflet`; import Leaflet CSS once at app entry.
**Where**: `package.json`
**Depends on**: None
**Reuses**: NONE
**Requirement**: CMAPF-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Gate check passes: `npm run build; npm test`

**Tests**: none
**Gate**: build
**Commit**: `build(deps): add leaflet, react-leaflet and leaflet.heat`

---

### T2: Campaigns API client

**What**: Types `Campaign`, `CampaignArea`, `CampaignPoint`, `CampaignPointsResponse`; `listCampaigns()` and `getCampaignPoints(id)`.
**Where**: `src/api/campaigns.ts`
**Depends on**: T1
**Reuses**: `apiRequest` in `src/api/client.ts`
**Requirement**: CMAPF-01, CMAPF-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Tests assert paths `/api/campaigns` and `/api/campaigns/{id}/points`
- [x] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(api): add campaigns client`

---

### T3: Analyses client sends campaign and position

**What**: `createAnalysis(file, { modelId, campaignId, latitude, longitude })`; types gain `campaign` and `location`, lose `coordinates`; add `getOrgStats()` with `active_campaign {id, name} | null`.
**Where**: `src/api/analyses.ts`
**Depends on**: T2
**Reuses**: existing `createAnalysis`
**Requirement**: CMAPF-01, CMAPF-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Tests: FormData has `campaign_id`; lat/lon present only when given; never `coordinates`/`campaign_name`
- [x] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(api): send campaign and position on upload`

---

### T4: Dedupe key includes campaign and position

**What**: `createAnalysisOnce` takes the options object from T3 and keys on file, model, campaign, lat, lon.
**Where**: `src/upload/createAnalysisOnce.ts`
**Depends on**: T3
**Reuses**: existing key builder
**Requirement**: CMAPF-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Same file with different campaign is not deduped
- [x] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `fix(upload): dedupe uploads by campaign and position`

---

### T5: Campaign select and lat/lon inputs on upload

**What**: Replace free-text campaign and coordinates with a campaign select (from `listCampaigns`) and two optional numeric inputs; client-side pair and numeric checks; pass values in navigation state.
**Where**: `src/pages/NovaAnalisePage.tsx`
**Depends on**: None
**Reuses**: existing form layout and error display
**Requirement**: CMAPF-02

**Tools**:

- MCP: NONE
- Skill: `frontend-design`

**Done when**:

- [x] Tests for spec "Upload with campaign" AC 1, 2, 5 and edge cases (list failure, non-numeric)
- [x] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(upload): pick campaign and optional position`

---

### T6: Loading page forwards campaign and position

**What**: Read campaign/lat/lon from navigation state and pass them to `createAnalysisOnce`; on error return to upload with backend `detail`.
**Where**: `src/pages/LoadingPage.tsx`
**Depends on**: T5
**Reuses**: existing error redirect
**Requirement**: CMAPF-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Tests for spec AC 3, 4, 6, 7
- [ ] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(upload): forward campaign and position to API`

---

### T7: Location on the result metrics tab

**What**: Show campaign name linked to `/campanhas/:id`, lat/lon to 5 decimals, and a "simulado" tag.
**Where**: `src/pages/resultado/ResultadoMetricsTab.tsx`
**Depends on**: T6
**Reuses**: existing campaign row
**Requirement**: CMAPF-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Tests for spec "Location on result" AC 1-2
- [ ] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(resultado): show analysis location and campaign link`

---

### T8: Map styling rules

**What**: Pure functions: marker colour by primary class, fill vs hollow by `location_source`, heat weight, `hasSimulatedData(campaign, points)`.
**Where**: `src/domain/campaignMap.ts`
**Depends on**: None
**Reuses**: colours from `src/domain/detectionDisplay.ts`
**Requirement**: CMAPF-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] One test per branch (MILCO, NOMBO, null; entered, simulated; weight floor)
- [ ] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(map): add campaign map styling rules`

---

### T9: `CampaignMap` component

**What**: Leaflet map fitted to the area: rectangle, circle markers per point styled by T8, popup with link, heat layer toggle, simulated badge, empty-state text.
**Where**: `src/components/CampaignMap.tsx`
**Depends on**: T8
**Reuses**: `DetectionClassLegend`
**Requirement**: CMAPF-03

**Tools**:

- MCP: `cursor-ide-browser` (visual check)
- Skill: `frontend-design`

**Done when**:

- [ ] Tests (react-leaflet mocked) for spec "Campaign map" AC 1-7
- [ ] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(map): add campaign map component`

---

### T10: `CampanhaPage` and route

**What**: Page at `/campanhas/:id` that loads points and renders `CampaignMap`, with loading, not-found and error states; route registered in `App`.
**Where**: `src/pages/CampanhaPage.tsx`
**Depends on**: T9
**Reuses**: `ResultadoPage` loading/error pattern
**Requirement**: CMAPF-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Tests for AC 8 and successful load
- [ ] Gate check passes: `npm test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(map): add campaign page route`

---

### T11: Active campaign on Home from stats

**What**: Remove `ACTIVE_CAMPAIGN`; KPI reads `getOrgStats().active_campaign`, linked to `/campanhas/:id` when `id` exists.
**Where**: `src/pages/HomePage.tsx`
**Depends on**: T10
**Reuses**: `KpiCard`
**Requirement**: CMAPF-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Tests for spec "Location on result and Home" AC 3-4
- [ ] Gate check passes: `npm run build; npm test`

**Tests**: unit
**Gate**: build
**Commit**: `feat(home): show active campaign from stats`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 ------→ T2 ------→ T3 ------→ T4
Phase 2:  T5 ------→ T6 ------→ T7
Phase 3:  T8 ------→ T9 ------→ T10 -----→ T11
```

## Diagram-Definition Cross-Check

Each task depends only on its predecessor in the phase; cross-phase needs (T5 on T2/T3, T6 on T4, T7 on T3, T9 on T1/T2) are satisfied by phase order.

| Task | Depends On (body) | Diagram | Status |
| --- | --- | --- | --- |
| T1 | None | start | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | T2 | T2→T3 | ✅ |
| T4 | T3 | T3→T4 | ✅ |
| T5 | None | start | ✅ |
| T6 | T5 | T5→T6 | ✅ |
| T7 | T6 | T6→T7 | ✅ |
| T8 | None | start | ✅ |
| T9 | T8 | T8→T9 | ✅ |
| T10 | T9 | T9→T10 | ✅ |
| T11 | T10 | T10→T11 | ✅ |

## Test Co-location Validation

| Task | Layer | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Dependencies | none | none | ✅ |
| T2 | API client | unit | unit | ✅ |
| T3 | API client | unit | unit | ✅ |
| T4 | Upload helper | unit | unit | ✅ |
| T5 | Page | unit | unit | ✅ |
| T6 | Page | unit | unit | ✅ |
| T7 | Component | unit | unit | ✅ |
| T8 | Domain | unit | unit | ✅ |
| T9 | Component | unit | unit | ✅ |
| T10 | Page | unit | unit | ✅ |
| T11 | Page | unit | unit | ✅ |
