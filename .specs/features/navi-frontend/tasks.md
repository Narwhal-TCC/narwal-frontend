# Navi Frontend Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/navi-frontend/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none in repo - strong defaults applied; test stack from approved `design.md` (Vitest + Testing Library).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain (`src/domain/*`) | unit | All branches; 1:1 to mapped ACs for classification/ids | `src/domain/**/*.test.ts` | `npm test` |
| API / auth storage (`src/api/*`, `src/auth/token.ts`) | unit | Happy + error mapping; token get/set/clear | `src/**/*.test.ts` | `npm test` |
| React pages / components / contexts | unit | Happy + listed error/empty paths per task ACs | `src/**/*.test.tsx` | `npm test` |
| Scaffold / tokens / static assets | none | Build gate only | - | build gate only |

## Gate Check Commands

> Generated from design + strong defaults - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm test` |
| Full | After page/component tasks | `npm test` |
| Build | After scaffold/config/asset tasks or phase completion | `npm test && npm run build` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

```
T1 -> T2 -> T3 -> T4 -> T5 -> T6 -> T7
```

### Phase 2: Auth & shell

```
T8 -> T9 -> T10 -> T11 -> T12
```

### Phase 3: Login & Home

```
T13 -> T14 -> T15
```

### Phase 4: Analysis flow

```
T16 -> T17 -> T18 -> T19
```

### Phase 5: History

```
T20 -> T21
```

---

## Task Breakdown

### Phase 1: Foundation

### T1: Scaffold Vite React TypeScript app

**What**: Create Vite + React + TS project with React Router, Tailwind v4, Vitest, Testing Library, `/api` proxy to `localhost:8080`, and base `src/main.tsx` entry.
**Where**: `package.json`
**Depends on**: None
**Reuses**: none (greenfield)
**Requirement**: foundation for NAVI-*

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `npm install` succeeds with listed deps
- [x] `vite.config.ts` proxies `/api` to backend and strips prefix per design
- [x] `npm test` and `npm run build` scripts exist and run (even if minimal)
- [x] Gate check passes: `npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `chore(navi): scaffold vite react app with proxy and vitest`

---

### T2: Add design tokens stylesheet

**What**: Add `data-theme` CSS variables for dark (default) and light from Figma Login colors, wired into the app entry.
**Where**: `src/styles/tokens.css`
**Depends on**: T1
**Reuses**: Figma token notes in design.md
**Requirement**: NAVI-06

**Tools**:

- MCP: `plugin-figma-figma` (optional color check)
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Dark and light variable sets exist
- [x] App imports tokens stylesheet
- [x] Gate check passes: `npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `feat(navi): add dark and light CSS design tokens`

---

### T3: Implement detection classification domain

**What**: Add MILCO/NOMBO helpers (`confidence >= 0.80` → MILCO) with unit tests for threshold edges.
**Where**: `src/domain/classification.ts`
**Depends on**: T2
**Reuses**: design Data Models
**Requirement**: NAVI-21, NAVI-11, NAVI-25, NAVI-26

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `classifyDetection`, `countMilco`, `analysisHasClass` exported
- [x] Tests cover 0.79/0.80/0.81 and empty list
- [x] Gate check passes: `npm test`
- [x] Test count: ≥4 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add milco nombo confidence classification`

---

### T4: Implement short id display helper

**What**: Add `shortId(id)` returning the first 8 characters for list cards.
**Where**: `src/domain/idDisplay.ts`
**Depends on**: T3
**Reuses**: none
**Requirement**: NAVI-24

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] `shortId` implemented with unit tests for short and long ids
- [x] Gate check passes: `npm test`
- [x] Test count: ≥2 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add analysis short id display helper`

---

### T5: Implement API fetch client

**What**: Add typed `apiRequest` with Bearer injection, JSON parsing, and `ApiError` from `{code,message}` bodies.
**Where**: `src/api/client.ts`
**Depends on**: T4
**Reuses**: design error table
**Requirement**: NAVI-01, NAVI-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Success and error paths unit-tested (mock `fetch`)
- [x] Unauthorized responses expose code `UNAUTHORIZED`
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add api client with bearer and error mapping`

---

### T6: Implement JWT localStorage token helpers

**What**: Add get/set/clear for access token in `localStorage`.
**Where**: `src/auth/token.ts`
**Depends on**: T5
**Reuses**: none
**Requirement**: NAVI-01, NAVI-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Unit tests cover set, get, clear
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add jwt localStorage token helpers`

---

### T7: Implement ThemeContext

**What**: Provide dark/light theme state, default dark, persist `navi-theme`, toggle, and set `document.documentElement.dataset.theme`.
**Where**: `src/theme/ThemeContext.tsx`
**Depends on**: T6
**Reuses**: `src/styles/tokens.css`
**Requirement**: NAVI-06, NAVI-07, NAVI-08

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] RTL tests cover default dark, toggle, and restore from localStorage
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add theme context with persisted dark light toggle`

---

### Phase 2: Auth & shell

### T8: Implement auth API module

**What**: Add `login` and `me` functions calling `/api/auth/login` and `/api/auth/me`.
**Where**: `src/api/auth.ts`
**Depends on**: T7
**Reuses**: `src/api/client.ts`
**Requirement**: NAVI-01, NAVI-02

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Unit tests mock client/fetch for success and `INVALID_CREDENTIALS`
- [x] Gate check passes: `npm test`
- [x] Test count: ≥2 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add auth login and me api module`

---

### T9: Implement AuthContext

**What**: Provide login/logout/user state; store token on login; clear on logout; load `me` when token present.
**Where**: `src/auth/AuthContext.tsx`
**Depends on**: T8
**Reuses**: `src/auth/token.ts`, `src/api/auth.ts`
**Requirement**: NAVI-01, NAVI-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] RTL tests cover login success, logout clears token, failed login keeps logged out
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add auth context for session lifecycle`

---

### T10: Implement ProtectedRoute

**What**: Redirect unauthenticated users to `/login` with return path; render outlet/children when authenticated.
**Where**: `src/auth/ProtectedRoute.tsx`
**Depends on**: T9
**Reuses**: AuthContext
**Requirement**: NAVI-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] RTL/router tests cover redirect when no token and render when authenticated
- [x] Gate check passes: `npm test`
- [x] Test count: ≥2 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add protected route with login return url`

---

### T11: Implement Sidebar

**What**: Build Figma sidebar with nav links (Visão geral, Nova análise, Histórico), theme toggle, user label, and Sair.
**Where**: `src/layout/Sidebar.tsx`
**Depends on**: T10
**Reuses**: ThemeContext, AuthContext
**Requirement**: NAVI-30, NAVI-31, NAVI-05, NAVI-07

**Tools**:

- MCP: `plugin-figma-figma`
- Skill: `figma-implement-design`, `tlc-spec-driven`

**Done when**:

- [x] Active nav state works; Sair calls logout; theme toggle wired
- [x] RTL tests cover nav targets and logout click
- [x] Gate check passes: `npm test`
- [x] Test count: ≥2 tests pass

**Tests**: unit
**Gate**: full
**Commit**: `feat(navi): add app sidebar navigation and logout`

---

### T12: Implement AppShell and route table

**What**: Compose shell layout and register all routes from design (`/login`, `/`, `/analises/*`, `/historico`).
**Where**: `src/App.tsx`
**Depends on**: T11
**Reuses**: ProtectedRoute, Sidebar, page stubs as needed until later tasks fill pages
**Requirement**: NAVI-30, NAVI-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Route table matches design paths
- [x] Unauth visiting `/` redirects to login
- [x] Gate check passes: `npm test`
- [x] Test count: ≥1 router smoke test pass

**Tests**: unit
**Gate**: full
**Commit**: `feat(navi): wire app shell and protected routes`

---

### Phase 3: Login & Home

### T13: Implement LoginPage

**What**: Build Login UI (Figma) with empty-field error, API credential error, success navigation to `next` or `/`.
**Where**: `src/pages/LoginPage.tsx`
**Depends on**: T12
**Reuses**: AuthContext, ThemeContext, tokens, assets
**Requirement**: NAVI-01, NAVI-02, NAVI-03, NAVI-04

**Tools**:

- MCP: `plugin-figma-figma`
- Skill: `figma-implement-design`, `tlc-spec-driven`

**Done when**:

- [x] RTL tests: empty submit shows required message without API; invalid credentials show error; success navigates
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: full
**Commit**: `feat(navi): implement login page with validation errors`

---

### T14: Implement analyses API module

**What**: Add list/get/create analysis client helpers matching backend shapes.
**Where**: `src/api/analyses.ts`
**Depends on**: T13
**Reuses**: `src/api/client.ts`
**Requirement**: NAVI-10, NAVI-16, NAVI-19, NAVI-24

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Unit tests cover list, get, create (mock fetch) including multipart create
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add analyses list get and upload api`

---

### T15: Implement HomePage dashboard

**What**: Fetch analyses (`limit=50`), show KPIs (count, last analysis time, MILCO via page detail enrich), static campaign copy, CTA to nova análise.
**Where**: `src/pages/HomePage.tsx`
**Depends on**: T14
**Reuses**: classification, analyses API, AppShell
**Requirement**: NAVI-09, NAVI-10, NAVI-11, NAVI-12, NAVI-13

**Tools**:

- MCP: `plugin-figma-figma`
- Skill: `figma-implement-design`, `tlc-spec-driven`

**Done when**:

- [x] RTL tests with mocked API: empty org zeros; populated counts; CTA navigates
- [x] Single enrich failure does not crash page
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: full
**Commit**: `feat(navi): implement home dashboard with client kpis`

---

### Phase 4: Analysis flow

### T16: Implement NovaAnalisePage

**What**: Upload UI with PNG/JPEG ≤10MB client validation and handoff to Loading route with selected file.
**Where**: `src/pages/NovaAnalisePage.tsx`
**Depends on**: T15
**Reuses**: design UploadScreen
**Requirement**: NAVI-14, NAVI-15, NAVI-16

**Tools**:

- MCP: `plugin-figma-figma`
- Skill: `figma-implement-design`, `tlc-spec-driven`

**Done when**:

- [x] RTL tests reject invalid type/size; accept valid file and navigate to loading
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: full
**Commit**: `feat(navi): implement nova analise upload validation`

---

### T17: Implement LoadingPage

**What**: Full-page loading that POSTs the pending file, then navigates to Resultado or back to Nova análise with Portuguese API error.
**Where**: `src/pages/LoadingPage.tsx`
**Depends on**: T16
**Reuses**: analyses API
**Requirement**: NAVI-16, NAVI-17, NAVI-18

**Tools**:

- MCP: `plugin-figma-figma`
- Skill: `figma-implement-design`, `tlc-spec-driven`

**Done when**:

- [x] RTL tests: success navigates to `/analises/:id`; error returns to nova with message; missing file redirects to nova
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: full
**Commit**: `feat(navi): implement analysis loading and upload post`

---

### T18: Implement DetectionOverlay

**What**: Render image (or placeholder) and scaled absolute boxes from pixel coords with MILCO/NOMBO styling.
**Where**: `src/components/DetectionOverlay.tsx`
**Depends on**: T17
**Reuses**: classification
**Requirement**: NAVI-19, NAVI-20, NAVI-21, NAVI-22, NAVI-23

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] RTL tests: empty detections; placeholder when no url; box geometry style uses scaled left/top/width/height
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `feat(navi): add detection overlay scaled to image`

---

### T19: Implement ResultadoPage

**What**: Load analysis by id (or location state), show overlay + detections list with confidence and class badges.
**Where**: `src/pages/ResultadoPage.tsx`
**Depends on**: T18
**Reuses**: DetectionOverlay, analyses API, shortId
**Requirement**: NAVI-19, NAVI-20, NAVI-21, NAVI-22, NAVI-23

**Tools**:

- MCP: `plugin-figma-figma`
- Skill: `figma-implement-design`, `tlc-spec-driven`

**Done when**:

- [x] RTL tests: renders detections; empty list treatment; null image_url placeholder
- [x] Gate check passes: `npm test`
- [x] Test count: ≥3 tests pass

**Tests**: unit
**Gate**: full
**Commit**: `feat(navi): implement resultado page with overlay and list`

---

### Phase 5: History

### T20: Implement HistoricoPage

**What**: List analyses with short ids, client MILCO/NOMBO filters (detail enrich), empty state, Carregar mais via offset, open Resultado.
**Where**: `src/pages/HistoricoPage.tsx`
**Depends on**: T19
**Reuses**: analyses API, classification, shortId
**Requirement**: NAVI-24, NAVI-25, NAVI-26, NAVI-27, NAVI-28, NAVI-29

**Tools**:

- MCP: `plugin-figma-figma`
- Skill: `figma-implement-design`, `tlc-spec-driven`

**Done when**:

- [ ] RTL tests: list render; MILCO filter; empty state; load more append; row navigates to result
- [ ] Gate check passes: `npm test`
- [ ] Test count: ≥5 tests pass

**Tests**: unit
**Gate**: full
**Commit**: `feat(navi): implement historico list filters and pagination`

---

### T21: Download Figma assets and finalize visual parity

**What**: Persist logos/waves/icons into `src/assets`, replace any remote MCP URLs, and align Login/Shell/pages to Figma dark+light screens.
**Where**: `src/assets/`
**Depends on**: T20
**Reuses**: Figma MCP asset exports
**Requirement**: visual success criteria; NAVI-09

**Tools**:

- MCP: `plugin-figma-figma`
- Skill: `figma-implement-design`, `tlc-spec-driven`

**Done when**:

- [ ] No ephemeral `figma.com/api/mcp/asset` URLs remain in source
- [ ] Light and dark screens use tokenized colors
- [ ] Gate check passes: `npm test && npm run build`

**Tests**: none
**Gate**: build
**Commit**: `feat(navi): vendor figma assets and finalize visual tokens`

---

## Phase Execution Map

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5

Phase 1:  T1 -> T2 -> T3 -> T4 -> T5 -> T6 -> T7
Phase 2:  T8 -> T9 -> T10 -> T11 -> T12
Phase 3:  T13 -> T14 -> T15
Phase 4:  T16 -> T17 -> T18 -> T19
Phase 5:  T20 -> T21
```

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 Scaffold | config entry `package.json` | ✅ Granular |
| T2 Tokens | 1 stylesheet | ✅ Granular |
| T3 Classification | 1 domain module | ✅ Granular |
| T4 Short id | 1 helper | ✅ Granular |
| T5 API client | 1 module | ✅ Granular |
| T6 Token helpers | 1 module | ✅ Granular |
| T7 ThemeContext | 1 context | ✅ Granular |
| T8 Auth API | 1 module | ✅ Granular |
| T9 AuthContext | 1 context | ✅ Granular |
| T10 ProtectedRoute | 1 component | ✅ Granular |
| T11 Sidebar | 1 component | ✅ Granular |
| T12 AppShell routes | 1 app file | ✅ Granular |
| T13 LoginPage | 1 page | ✅ Granular |
| T14 Analyses API | 1 module | ✅ Granular |
| T15 HomePage | 1 page | ✅ Granular |
| T16 NovaAnalisePage | 1 page | ✅ Granular |
| T17 LoadingPage | 1 page | ✅ Granular |
| T18 DetectionOverlay | 1 component | ✅ Granular |
| T19 ResultadoPage | 1 page | ✅ Granular |
| T20 HistoricoPage | 1 page | ✅ Granular |
| T21 Assets folder | assets dir | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | (root) | ✅ |
| T2 | T1 | T1 -> T2 | ✅ |
| T3 | T2 | T2 -> T3 | ✅ |
| T4 | T3 | T3 -> T4 | ✅ |
| T5 | T4 | T4 -> T5 | ✅ |
| T6 | T5 | T5 -> T6 | ✅ |
| T7 | T6 | T6 -> T7 | ✅ |
| T8 | T7 | T7 -> T8 (cross-phase ok) | ✅ |
| T9 | T8 | T8 -> T9 | ✅ |
| T10 | T9 | T9 -> T10 | ✅ |
| T11 | T10 | T10 -> T11 | ✅ |
| T12 | T11 | T11 -> T12 | ✅ |
| T13 | T12 | T12 -> T13 (cross-phase ok) | ✅ |
| T14 | T13 | T13 -> T14 | ✅ |
| T15 | T14 | T14 -> T15 | ✅ |
| T16 | T15 | T15 -> T16 (cross-phase ok) | ✅ |
| T17 | T16 | T16 -> T17 | ✅ |
| T18 | T17 | T17 -> T18 | ✅ |
| T19 | T18 | T18 -> T19 | ✅ |
| T20 | T19 | T19 -> T20 (cross-phase ok) | ✅ |
| T21 | T20 | T20 -> T21 | ✅ |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Scaffold | none | none | ✅ |
| T2 | Tokens | none | none | ✅ |
| T3 | Domain | unit | unit | ✅ |
| T4 | Domain | unit | unit | ✅ |
| T5 | API | unit | unit | ✅ |
| T6 | Auth storage | unit | unit | ✅ |
| T7 | Context | unit | unit | ✅ |
| T8 | API | unit | unit | ✅ |
| T9 | Context | unit | unit | ✅ |
| T10 | Component | unit | unit | ✅ |
| T11 | Component | unit | unit | ✅ |
| T12 | App routes | unit | unit | ✅ |
| T13 | Page | unit | unit | ✅ |
| T14 | API | unit | unit | ✅ |
| T15 | Page | unit | unit | ✅ |
| T16 | Page | unit | unit | ✅ |
| T17 | Page | unit | unit | ✅ |
| T18 | Component | unit | unit | ✅ |
| T19 | Page | unit | unit | ✅ |
| T20 | Page | unit | unit | ✅ |
| T21 | Assets | none | none | ✅ |
