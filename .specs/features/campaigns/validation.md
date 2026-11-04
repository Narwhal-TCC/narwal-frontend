# Campaigns CRUD (frontend) — Validation

**Verdict:** PASS  
**Diff range:** `598f5c4`..`410a4e1` (+ traceability commit)  
**Date:** 2026-11-02

## Gate evidence

- `npm test -- --run`: 33 files, 178 tests passed (2026-11-02)
- `npm run build`: success (`tsc -b && vite build`)

## Acceptance criteria (spec-anchored)

| ID | Evidence |
| --- | --- |
| CAMPF-04 | `src/api/campaigns.ts:51-68` POST/PATCH/GET; `src/api/campaigns.test.ts:50-119` |
| CAMPF-03 | `src/App.tsx:35-37` routes + legacy redirect; `HomePage.tsx:245`, `ResultadoMetricsTab.tsx:123`; tests updated |
| CAMPF-01 | `src/layout/Sidebar.tsx:18` Campanhas → `/campaigns`; `Sidebar.test.tsx:62-88` |
| CAMPF-02 | `src/pages/CampaignsPage.tsx` list, modal CRU, disabled area; `CampaignsPage.test.tsx` |
| CAMPF-05 | No upload cache added; `NovaAnalisePage.tsx:60` still `listCampaigns` on mount |

## Discrimination sensor

Scratch mutants (not committed): removed `area` from PATCH when `analyses_count > 0`; removed legacy redirect. `CampaignsPage.test.tsx` and route tests failed on both — sensor PASS.

## Deviations

- API errors surface via `ApiError.message` from JSON `message` field (`client.ts:45-49`), not FastAPI-style `detail` — consistent with existing frontend modules.
- `.specs/` partially gitignored; tasks.md updates live locally unless force-added.
