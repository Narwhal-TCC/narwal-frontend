# Campaigns CRUD (frontend) Specification

Companion: `narwal-backend/.specs/features/campaigns/spec.md`. Builds on campaign-map (`CMAPF-*`); replaces its out-of-scope campaign create/edit UI and campaign index.

## Problem Statement

Campaigns exist only via seed data and deep links to `/campanhas/:id`. Operators cannot manage campaigns in the app, and routes mix Portuguese slug with English API paths. They need a sidebar entry, a management page at `/campaigns`, and map/detail at `/campaigns/:id` — create and update only; delete is not in this release.

## Goals

- [x] Left sidebar links to `/campaigns` for list, create, and edit.
- [x] All in-app campaign links use the `/campaigns` route prefix; legacy `/campanhas/*` redirects.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Delete campaign UI or API client | Backend delete deferred |
| Map-drawn area picker | Form fields only (discuss) |
| Moving upload/create flow off Nova análise | Still picks from `GET /campaigns` |
| Offline basemap / heatmap changes | campaign-map unchanged |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| List layout | responsive table: name, analyses count, simulated badge, actions | Matches Histórico density | y |
| Create / edit UX | modal or slide-over form on `/campaigns` (agent picks one consistent with Navi panels) | User chose form fields A | y |
| Form fields | name; min/max lat; min/max lon; checkbox "Simular posição quando não informada" → `simulated` | Matches API | y |
| Area fields on edit | disabled when `analyses_count > 0`; show short hint | Mirrors backend 409 | y |
| Error copy | show backend `detail` under the form | Nova análise pattern | y |
| Sidebar label | "Campanhas" → `/campaigns` | User confirmed left sidebar | y |
| Detail map route | `/campaigns/:id` reuses `CampanhaPage` + `CampaignMap` | User chose `/campaigns` base | y |
| Legacy routes | `Navigate` replace from `/campanhas/:id` to `/campaigns/:id` | Avoid broken Home/result links during transition | y |
| Sidebar icon | reuse existing asset set (e.g. grid variant) or add matching 18px icon | Visual parity with nav items | n |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Sidebar navigation ⭐ MVP

**User Story**: As an operator, I want Campanhas in the left rail so that I can open campaign management.

**Acceptance Criteria**:

1. WHEN the app shell renders THEN the left sidebar SHALL include a link labeled "Campanhas" pointing to `/campaigns`.
2. WHEN the user is on `/campaigns` or `/campaigns/:id` THEN the Campanhas link SHALL appear active per existing `NavLink` styling.
3. The Campanhas link SHALL sit with the other primary nav items (below Histórico or in logical survey grouping — agent orders consistently).

**Independent Test**: render `Sidebar`; link href is `/campaigns`.

### P1: Campaign list and CRU ⭐ MVP

**User Story**: As an operator, I want to list, create, and edit campaigns on one page so that I do not depend on seed data.

**Acceptance Criteria**:

1. WHEN `/campaigns` loads THEN the system SHALL call `GET /campaigns` and render a row per campaign with name, `analyses_count`, simulated indicator, and actions to edit and open map.
2. WHEN the user opens create THEN the system SHALL show the form (name, four bounds, simulated checkbox) and on submit call `POST /campaigns`; on success SHALL refresh the list and close the form.
3. WHEN the user opens edit THEN the system SHALL load the campaign (from list row or `GET /campaigns/{id}`), prefill the form, and on submit call `PATCH /campaigns/{id}`; on success SHALL refresh the list.
4. WHILE `analyses_count > 0` on edit THEN the system SHALL disable area inputs and SHALL still allow name and simulated changes.
5. IF the backend returns `409` or `400` THEN the system SHALL show the `detail` string and keep the form open.
6. WHEN the org has no campaigns THEN the system SHALL show an empty state with a control to create the first campaign.
7. WHEN list load fails THEN the system SHALL show an error message and a retry affordance.
8. WHEN the user chooses open map on a row THEN the system SHALL navigate to `/campaigns/:id`.

**Independent Test**: mock API — list renders two rows; create calls POST; edit with count > 0 sends PATCH without changed area fields.

### P1: Routes and deep links ⭐ MVP

**User Story**: As an operator, I want one URL scheme for campaigns so that links from Home and results stay consistent.

**Acceptance Criteria**:

1. WHEN the user opens `/campaigns/:id` THEN the system SHALL render the existing campaign map page (area, points, heatmap) unchanged in behavior from campaign-map.
2. WHEN the user opens `/campanhas/:id` THEN the system SHALL redirect with `replace` to `/campaigns/:id`.
3. WHEN Home shows active campaign with id THEN the link SHALL target `/campaigns/:id`.
4. WHEN the result metrics tab shows a campaign with id THEN the link SHALL target `/campaigns/:id`.
5. The system SHALL NOT register new UI links to `/campanhas/*`.

**Independent Test**: App routes — `/campanhas/x` ends on `/campaigns/x`; Home link href uses `/campaigns/`.

### P1: API client ⭐ MVP

**User Story**: As a developer, I want typed client methods for CRUD so that pages stay thin.

**Acceptance Criteria**:

1. WHEN `createCampaign(body)` is called THEN the client SHALL `POST /api/campaigns` with JSON body and return `Campaign`.
2. WHEN `updateCampaign(id, body)` is called THEN the client SHALL `PATCH /api/campaigns/{id}` and return `Campaign`.
3. WHEN `getCampaign(id)` is called THEN the client SHALL `GET /api/campaigns/{id}` and return `Campaign`.
4. IF the server returns non-OK THEN the client SHALL throw `ApiError` with `detail` preserved like existing API modules.

**Independent Test**: unit tests on `campaigns.ts` mock `fetch` for POST/PATCH/GET.

### P2: Upload page freshness

**User Story**: As an operator, I want new campaigns to appear on Nova análise without redeploy.

**Acceptance Criteria**:

1. WHEN the user creates a campaign on `/campaigns` and navigates to Nova análise THEN the campaign select SHALL include the new campaign on load (existing `listCampaigns` on mount — no extra work unless cache introduced).

**Independent Test**: manual or e2e; documented as smoke — no duplicate fetch layer.

---

## Edge Cases

- IF create succeeds while list is empty THEN empty state SHALL disappear after refresh.
- IF PATCH area is attempted via tampered client AND backend returns `409` THEN UI SHALL show backend detail even if fields looked enabled.
- WHEN lat/lon inputs contain non-numeric text on the form THEN the system SHALL block submit with "Coordenadas inválidas" before calling the API.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CAMPF-01 | P1: Sidebar navigation | Execute | Done |
| CAMPF-02 | P1: Campaign list and CRU | Execute | Done |
| CAMPF-03 | P1: Routes and deep links | Execute | Done |
| CAMPF-04 | P1: API client | Execute | Done |
| CAMPF-05 | P2: Upload page freshness | Execute | Done |

**Coverage:** 5 total, 5 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] Demo: sidebar → create campaign → open map → upload selects new campaign → rename on list page.
- [x] `npm test` and `npm run build` pass.
