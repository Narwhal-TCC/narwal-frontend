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

- **Feature**: navi-ui-polish (`.specs/features/navi-ui-polish/`)
- **Phase / Task**: Execute complete — Verifier PASS
- **Completed**: T1–T8 + validation.md PASS (`validate_state` 0 errors); commits `a12e9fb`…`a332aa6`
- **In-progress**: none
- **Next step**: optional hardening from validation Fix Plans; push only if requested
- **Blockers**: none
- **Uncommitted files**: `.specs/STATE.md` (handoff); lessons candidates added
- **Branch**: master (ahead of origin by 8)
- **Prior feature**: navi-frontend Verifier PASS (`dad3795`)
- **Workers**: [Batch A](2f7ed779-0114-4296-8ad4-694ca04aaa79) T1–T3; [Batch B](6a9643dd-8996-49f8-aba7-52ec805da9f4) T4–T8; [Verifier](e8fcba42-15e7-4874-bc3c-8438fe584e50)
