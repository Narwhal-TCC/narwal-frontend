# Navi Frontend Specification

## Problem Statement

Narwal’s backend can authenticate users and run org-scoped sonar analysis, but there is no UI. Operators need a Figma-faithful **Navi** SPA to log in, upload sonar images, see detection overlays, and revisit history without calling the API by hand.

## Goals

- [ ] Operators complete login → nova análise → resultado (boxes + list) against the live backend
- [ ] Operators browse Histórico with client MILCO/NOMBO filters and reopen a past analysis
- [ ] UI matches Figma Navi screens in dark and light themes on desktop
- [ ] Design-only metrics (campaign, MILCO badges) use documented client heuristics, not invented APIs

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Backend CORS / new analysis APIs | Frontend uses Vite proxy; API contract stays as shipped |
| Real model MILCO/NOMBO labels | Client confidence heuristic only |
| Campaign / org metadata API | Static design copy on Home |
| Mobile / tablet layouts | Figma is desktop; no invented mobile IA |
| English i18n | Portuguese UI only |
| Server-side history search/filters | Client-side on fetched page |
| Registration / invite / org admin | Seeded users only (backend MVP) |
| Annotated image generation on server | Client overlays boxes |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Stack | Vite + React + TypeScript + React Router + Tailwind v4 | Greenfield; fits JWT SPA + Figma reference output | y (grill) |
| Brand | Navi (as Figma) | Pixel/copy fidelity | y (grill) |
| Theme | Dark + light; default dark; persist `localStorage` | Figma has both modes + toggle | y (grill) |
| Token storage | JWT in `localStorage` | Demo-friendly session across refresh | y (grill) |
| API access (dev) | Vite proxy to `localhost:8080` | Backend has no CORS | y (grill) |
| MILCO rule | `confidence ≥ 0.80` → MILCO, else NOMBO | Demo heuristic agreed in grill | y (grill) |
| Viewport | Desktop-first ≥1280 | Matches Figma frames | y (grill) |
| Result UI | Image overlay + detections list | Matches Resultado frames | y (grill) |
| Unauth | Redirect `/login` with return URL | Standard SPA auth | y (grill) |
| Home KPIs | From `limit=50` list; MILCO via detail enrich of that page; campaign static | API has no aggregates | y (grill) |
| UI language | Portuguese | Figma copy | y (grill) |
| Loading | Full-page Loading until `POST /analyses` completes | Figma Loading frame | y (grill) |
| Analysis id display | Short prefix in lists; full id on detail | Honest to ULID/UUID API ids | y (grill) |
| Upload guards | Client PNG/JPEG ≤10 MB + API errors | Matches backend contract | y (grill) |
| Logout | Clear token → `/login`; keep theme | Multi-user demos | y (grill) |
| History filters | Client-side on current fetched page | No filter API | y (grill) |
| Pagination | “Carregar mais” via `offset` | Avoid silent truncation | y (grill) |
| Missing `image_url` | Placeholder + detections + message | Still useful without image | y (grill) |
| Reopen history | Same Resultado via `GET /analyses/:id` | One result experience | y (grill) |
| Home MILCO enrich cost | Parallel GET detail for current list page only | List summaries lack per-box confidence | y (agent default; aligns with KPI decision) |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Login and session ⭐ MVP

**User Story**: As a seeded org member, I want to log in to Navi so that I can use protected analysis screens.

**Why P1**: Every other flow requires auth.

**Acceptance Criteria**:

1. WHEN a user submits valid credentials on the Login screen THEN the system SHALL call `POST /auth/login`, store the access token in `localStorage`, and navigate to the post-login destination
2. IF credentials are invalid (`INVALID_CREDENTIALS`) THEN the system SHALL remain on Login and SHALL show a Portuguese error state consistent with the Login - Erro design
3. IF username or password is empty on submit THEN the system SHALL show the required-fields error treatment from the Login - Erro design and SHALL NOT call the API
4. WHEN an unauthenticated user requests a protected route THEN the system SHALL redirect to `/login` and SHALL restore that route after a successful login
5. WHEN the user logs out THEN the system SHALL remove the access token from `localStorage` and SHALL navigate to `/login`

**Independent Test**: Log in with seeded admin; refresh stays authenticated; logout clears session; bad password shows error without token.

---

### P1: Theme toggle ⭐ MVP

**User Story**: As an operator, I want dark and light themes so that the UI matches the designed Navi modes.

**Why P1**: Figma ships both modes and a toggle on primary screens.

**Acceptance Criteria**:

1. The system SHALL render the app in dark theme when no theme preference is stored
2. WHEN the user activates the theme toggle THEN the system SHALL switch between dark and light themes and SHALL persist the choice in `localStorage`
3. WHEN the user reloads the app THEN the system SHALL restore the persisted theme

**Independent Test**: Toggle dark↔light; reload; preference survives.

---

### P1: Home dashboard ⭐ MVP

**User Story**: As an authenticated operator, I want a Home overview so that I can see recent activity and start a new analysis.

**Why P1**: Primary post-login landing in Figma.

**Acceptance Criteria**:

1. WHEN Home loads for an authenticated user THEN the system SHALL show the designed shell (sidebar + dashboard) with Portuguese labels from Figma
2. WHEN Home loads THEN the system SHALL fetch `GET /analyses?limit=50` and SHALL display analysis count and “última análise” relative time from the newest `created_at`
3. WHEN Home loads THEN the system SHALL enrich the current list page with detail fetches and SHALL display “Detecções MILCO” as the count of detections with `confidence ≥ 0.80`
4. The system SHALL show “Campanha ativa” as the static copy from design (e.g. “Santos 2026”)
5. WHEN the user chooses “Nova análise” (or equivalent CTA) THEN the system SHALL navigate to the Nova análise screen

**Independent Test**: With seeded analyses in the org, Home shows non-zero counts; empty org shows zeros; CTA reaches upload.

---

### P1: Nova análise and loading ⭐ MVP

**User Story**: As an operator, I want to upload a sonar image and wait through analysis so that I receive detections.

**Why P1**: Core product value.

**Acceptance Criteria**:

1. WHEN the user selects or drops a PNG or JPEG file ≤ 10 MB THEN the system SHALL accept it for upload
2. IF the file is not PNG/JPEG or exceeds 10 MB THEN the system SHALL show a Portuguese validation error and SHALL NOT call `POST /analyses`
3. WHEN the user confirms upload THEN the system SHALL show the full-page Loading state and SHALL call `POST /analyses` with multipart field `file`
4. WHEN `POST /analyses` returns `200` THEN the system SHALL navigate to Resultado for that analysis
5. IF the API returns `INVALID_IMAGE`, `MODEL_UNAVAILABLE`, `INFERENCE_TIMEOUT`, or another error code THEN the system SHALL leave Loading and SHALL show a Portuguese error the user can dismiss or retry from Nova análise

**Independent Test**: Upload fixture PNG; see Loading then Resultado. Reject oversized file client-side.

---

### P1: Resultado with overlay ⭐ MVP

**User Story**: As an operator, I want to see the sonar image with detection boxes and a detections list so that I can locate candidate mines.

**Why P1**: Visual proof of analysis.

**Acceptance Criteria**:

1. WHEN Resultado opens for an analysis id THEN the system SHALL load `GET /analyses/{id}` (or use the just-created payload) and SHALL render the image from `image_url` when present
2. WHEN detections are present THEN the system SHALL draw axis-aligned overlays scaled from pixel `x1,y1,x2,y2` to the displayed image size and SHALL list each detection with confidence
3. WHEN a detection has `confidence ≥ 0.80` THEN the system SHALL label it MILCO; otherwise the system SHALL label it NOMBO
4. IF `image_url` is null THEN the system SHALL show an image-unavailable placeholder and SHALL still show the detections list
5. WHEN detections is an empty list THEN the system SHALL show Resultado with zero overlays and an empty-detections treatment

**Independent Test**: Open a known analysis; boxes align to image; toggle a high/low confidence fixture for MILCO/NOMBO badges.

---

### P1: Histórico ⭐ MVP

**User Story**: As an operator, I want to list and filter past analyses so that I can reopen prior runs.

**Why P1**: Explicit product goal with Figma screens.

**Acceptance Criteria**:

1. WHEN Histórico loads THEN the system SHALL fetch `GET /analyses?limit=50&offset=0` and SHALL render cards/rows with short id prefix and summary fields available from the API
2. WHEN the user applies the MILCO filter THEN the system SHALL show only analyses that, after client classification of their detections, include at least one MILCO (enriching detail as needed for the current page)
3. WHEN the user applies the NOMBO filter THEN the system SHALL show only analyses that include at least one NOMBO under the same heuristic
4. WHEN no analyses match the active filter or the list is empty THEN the system SHALL show the “Resultado não encontrado” (or empty) treatment from design
5. WHEN the user activates “Carregar mais” THEN the system SHALL request the next `offset` page and SHALL append items
6. WHEN the user opens an analysis from Histórico THEN the system SHALL navigate to Resultado for that id via `GET /analyses/{id}`

**Independent Test**: Seed multiple analyses; filter MILCO/NOMBO; load more; reopen shows same Resultado as post-upload.

---

### P2: Shell navigation

**User Story**: As an operator, I want sidebar navigation so that I can move between Visão geral, Nova análise, and Histórico.

**Why P2**: Required for usable shell but implied by P1 screens; tracked separately for layout polish.

**Acceptance Criteria**:

1. WHEN the user selects a sidebar item THEN the system SHALL navigate to the corresponding route and SHALL reflect the active item visually per design
2. The system SHALL show operator identity context from `GET /auth/me` (or login session) in the sidebar user area when design includes it

**Independent Test**: Click each nav item; URL and active state match.

---

## Edge Cases

- IF the access token is missing or `GET /auth/me` / analyses return `UNAUTHORIZED` THEN the system SHALL clear the invalid token and redirect to `/login`
- IF `POST /analyses` takes a long time THEN the system SHALL keep showing Loading until success or error (no silent timeout shorter than the backend’s)
- IF “Carregar mais” returns an empty page THEN the system SHALL hide or disable further load-more
- IF detail enrich for Home/Histórico fails for one item THEN the system SHALL skip that item’s MILCO contribution without failing the whole page

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| NAVI-01 | P1: Login and session | Design | Implementing |
| NAVI-02 | P1: Login and session | Design | Implementing |
| NAVI-03 | P1: Login and session | Design | Implementing |
| NAVI-04 | P1: Login and session | Design | Implementing |
| NAVI-05 | P1: Login and session | Design | Implementing |
| NAVI-06 | P1: Theme toggle | Design | Implementing |
| NAVI-07 | P1: Theme toggle | Design | Implementing |
| NAVI-08 | P1: Theme toggle | Design | Implementing |
| NAVI-09 | P1: Home dashboard | Design | Implementing |
| NAVI-10 | P1: Home dashboard | Design | Implementing |
| NAVI-11 | P1: Home dashboard | Design | Implementing |
| NAVI-12 | P1: Home dashboard | Design | Implementing |
| NAVI-13 | P1: Home dashboard | Design | Implementing |
| NAVI-14 | P1: Nova análise and loading | Design | Verified |
| NAVI-15 | P1: Nova análise and loading | Design | Verified |
| NAVI-16 | P1: Nova análise and loading | Design | Verified |
| NAVI-17 | P1: Nova análise and loading | Design | Verified |
| NAVI-18 | P1: Nova análise and loading | Design | Verified |
| NAVI-19 | P1: Resultado with overlay | Design | Pending |
| NAVI-20 | P1: Resultado with overlay | Design | Pending |
| NAVI-21 | P1: Resultado with overlay | Design | Implementing |
| NAVI-22 | P1: Resultado with overlay | Design | Pending |
| NAVI-23 | P1: Resultado with overlay | Design | Pending |
| NAVI-24 | P1: Histórico | Design | Implementing |
| NAVI-25 | P1: Histórico | Design | Implementing |
| NAVI-26 | P1: Histórico | Design | Implementing |
| NAVI-27 | P1: Histórico | Design | Pending |
| NAVI-28 | P1: Histórico | Design | Pending |
| NAVI-29 | P1: Histórico | Design | Pending |
| NAVI-30 | P2: Shell navigation | Design | Implementing |
| NAVI-31 | P2: Shell navigation | Design | Implementing |

**ID format:** `NAVI-[NUMBER]`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 31 total, 0 mapped to tasks, 31 unmapped ⚠️ (tasks phase next)

---

## Success Criteria

- [ ] Seeded user can complete login → upload → resultado with visible overlays against local backend
- [ ] Histórico filters and reopen work with the confidence heuristic
- [ ] Dark/light toggle persists across reload
- [ ] Visual parity with Figma Navi frames on desktop for the listed screens
