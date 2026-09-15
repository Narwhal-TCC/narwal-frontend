# STATE

## Decisions

### AD-001
- **Decision**: Frontend stack is Vite + React + TypeScript + React Router + Tailwind CSS v4.
- **Reason**: Confirmed in feature grill for Navi SPA against FastAPI JWT API.
- **Trade-off**: Forgoes Next.js SSR/hosting helpers.
- **Scope**: Entire `narwal-frontend` application.
- **Date**: 2026-09-14
- **Status**: active

### AD-002
- **Decision**: Dev API access uses Vite proxy (`/api` → backend); JWT and theme preference live in `localStorage`.
- **Reason**: Backend has no CORS; demo needs refresh-stable auth and theme.
- **Trade-off**: XSS can read token; production split-origin needs later CORS or same-origin hosting.
- **Scope**: Auth, theme, API client, local DX.
- **Date**: 2026-09-14
- **Status**: active

### AD-003
- **Decision**: MILCO/NOMBO in the UI is a client heuristic (`confidence ≥ 0.80` → MILCO); campaign KPI copy is static.
- **Reason**: Backend detections lack operational class labels and campaign entity.
- **Trade-off**: Demo filters/badges are not model ground truth.
- **Scope**: Home KPIs, Histórico filters, Resultado badges.
- **Date**: 2026-09-14
- **Status**: active

## Handoff

- **Feature**: navi-frontend (`.specs/features/navi-frontend/`)
- **Phase / Task**: Execute complete — Verifier PASS
- **Completed**: T1–T21 + fix iteration 1 (`dad3795`); validation PASS (`validate_state` 0 errors)
- **In-progress**: Interactive UAT (awaiting user)
- **Next step**: Walk UAT with user against local backend; optional push when asked
- **Blockers**: none
- **Uncommitted files**: tasks.md status Complete; spec Verified; validation.md
- **Branch**: master
- **Commits**: `55b56d4`…`dad3795` (22 commits); 59 tests
