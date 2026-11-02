# Campaign Map Validation

**Date**: 2026-11-02
**Spec**: `.specs/features/campaign-map/spec.md`
**Diff range**: `fa56ced..HEAD` (T1–T11 + fix `e0e300b`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Validation Verdict

**Result**: PASS ✅

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | build deps |
| T2   | ✅ Done | campaigns client |
| T3   | ✅ Done | analyses upload fields |
| T4   | ✅ Done | dedupe key |
| T5   | ✅ Done | upload form |
| T6   | ✅ Done | loading forward |
| T7   | ✅ Done | result metrics location |
| T8   | ✅ Done | map domain rules |
| T9   | ✅ Done | CampaignMap component |
| T10  | ✅ Done | CampanhaPage route |
| T11  | ✅ Done | Home active campaign |

---

## Spec-Anchored Acceptance Criteria

### P1: Upload with campaign

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN upload loads THEN list campaigns from GET /campaigns, preselect if exactly one | select value `camp-1`, campaign name visible | `src/pages/NovaAnalisePage.test.tsx:175` - `expect(select).toHaveValue('camp-1')` | ✅ PASS |
| WHEN org has no campaigns THEN disable submit + "Nenhuma campanha cadastrada" | disabled button + exact copy | `src/pages/NovaAnalisePage.test.tsx:199` - `toHaveTextContent('Nenhuma campanha cadastrada')`; `src/pages/NovaAnalisePage.test.tsx:200` - `toBeDisabled()` | ✅ PASS |
| WHEN submit with campaign, empty lat/lon THEN send campaign_id, no latitude/longitude | FormData has campaign_id; no lat/lon keys | `src/api/analyses.test.ts:145` - `expect(formData.has('latitude')).toBe(false)`; `src/pages/LoadingPage.test.tsx:122` - `expect(options).not.toHaveProperty('latitude')` | ✅ PASS |
| WHEN submit with both lat and lon THEN send campaign_id, latitude, longitude | FormData strings `38.5`/`-9.1`; loading forwards numbers | `src/api/analyses.test.ts:160` - `expect(formData.get('latitude')).toBe('38.5')`; `src/pages/LoadingPage.test.tsx:156` - `toHaveBeenCalledWith(..., { latitude: 38.76543, longitude: -9.87654 })` | ✅ PASS |
| IF exactly one of lat/lon filled THEN block submit + "Informe latitude e longitude juntas" | alert text exact | `src/pages/NovaAnalisePage.test.tsx:229` - `toHaveTextContent('Informe latitude e longitude juntas')` | ✅ PASS |
| IF backend refuses upload THEN upload page shows backend detail | alert with detail string | `src/pages/LoadingPage.test.tsx:242` - `toHaveTextContent('Imagem inválida.')` | ✅ PASS |
| SHALL NOT send campaign_name or coordinates | FormData lacks those keys | `src/api/analyses.test.ts:176` - `expect(formData.has('coordinates')).toBe(false)`; `src/api/analyses.test.ts:177` - `expect(formData.has('campaign_name')).toBe(false)` | ✅ PASS |

### P1: Campaign map

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN /campanhas/:id loads THEN area rectangle + one marker per point | rectangle bounds + marker count | `src/components/CampaignMap.test.tsx:131` - `expect(JSON.parse(rectangle...)).toEqual(...)`; `src/components/CampaignMap.test.tsx:135` - `toHaveLength(2)`; `src/pages/CampanhaPage.test.tsx:77` - `findByTestId('campaign-map-stub')` | ✅ PASS |
| Colour markers MILCO red, NOMBO amber, none grey | token hex from `PRIMARY_CLASS_MARKER_COLORS` | `src/domain/campaignMap.test.ts:33` - `expect(markerColor('MILCO')).toBe(PRIMARY_CLASS_MARKER_COLORS.MILCO)`; `src/components/CampaignMap.test.tsx:155` - `expect(milcoPath.color).toBe(PRIMARY_CLASS_MARKER_COLORS.MILCO)` | ✅ PASS |
| simulated hollow, entered filled | fillOpacity 0 vs >0 | `src/domain/campaignMap.test.ts:47` - `expect(isMarkerFilled('entered')).toBe(true)`; `src/components/CampaignMap.test.tsx:169` - `expect(enteredPath.fillOpacity).toBeGreaterThan(0)`; `src/components/CampaignMap.test.tsx:170` - `expect(simulatedPath.fillOpacity).toBe(0)` | ✅ PASS |
| WHILE simulated THEN badge "Dados de localização simulados" | exact badge text | `src/components/CampaignMap.test.tsx:176` - `toHaveTextContent('Dados de localização simulados')` | ✅ PASS |
| WHEN heatmap on THEN density layer + markers visible; off removes layer | heat layer testid + marker count while on | `src/components/CampaignMap.test.tsx:193` - `getByTestId('heatmap-layer')`; `src/components/CampaignMap.test.tsx:194` - `expect(screen.getAllByTestId('map-marker')).toHaveLength(2)`; `src/components/CampaignMap.test.tsx:198` - `queryByTestId('heatmap-layer')).not.toBeInTheDocument()` | ✅ PASS |
| WHEN marker clicked THEN class, MILCO count, detection count, date, link /analises/:id | popup fields incl. formatted date | `src/components/CampaignMap.test.tsx:214` - `getByText('MILCO')`; `215` - `MILCO: 2`; `216` - `Detecções: 3`; `217` - `getByText(formattedDate)` with `formattedDate = '20 de jan de 2026, 11:30'` matching `formatPointDate` + `.replace('.', '')` in `src/components/CampaignMap.tsx:22-31`; `219-222` - link `href '/analises/01234567-...'` | ✅ PASS |
| WHEN no points THEN area + "Nenhuma análise nesta campanha" | empty testid text, zero markers | `src/components/CampaignMap.test.tsx:240` - `toHaveTextContent('Nenhuma análise nesta campanha')`; `243` - `toHaveLength(0)` | ✅ PASS |
| IF campaign not found THEN "Campanha não encontrada" | not-found copy | `src/pages/CampanhaPage.test.tsx:91` - `findByText('Campanha não encontrada.')` | ⚠️ Spec-precision gap — spec omits trailing period; test matches UI copy |

### P2: Location on result and Home

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN result has location THEN campaign link, lat/lon 5 decimals, simulado if simulated | href + coordinate strings | `src/pages/resultado/ResultadoMetricsTab.test.tsx:58` - `href '/campanhas/camp-1'`; `59` - `38.76543, -9.87654`; `70` - `getByText('simulado')` | ✅ PASS |
| WHEN no location THEN campaign name only | name without coords | `src/pages/resultado/ResultadoMetricsTab.test.tsx:80` - `getByText('Campanha Simulada')`; `81` - `queryByText(/^\d+\.\d+,/).not.toBeInTheDocument()` | ✅ PASS |
| WHEN Home loads THEN active_campaign KPI linked or "—" | link href or em dash | `src/pages/HomePage.test.tsx:124` - `href '/campanhas/camp-1'`; `52` - `toHaveTextContent('—')` | ✅ PASS |
| SHALL NOT contain hardcoded "Santos 2026" | absent from DOM | `src/pages/HomePage.test.tsx:54` - `queryByText('Santos 2026')).not.toBeInTheDocument()` | ✅ PASS |

**Status**: ✅ All ACs covered (1 spec-precision gap on not-found punctuation only)

---

## Edge Cases

- [x] GET /campaigns fails on upload → disable submit + error: `src/pages/NovaAnalisePage.test.tsx:209` - `toHaveTextContent('Falha ao carregar campanhas.')`
- [x] IF basemap tiles fail → area and markers still render: `src/components/CampaignMap.test.tsx:232` - `getByTestId('basemap-tiles-failed')`; `233` - `getByTestId('area-rectangle')`; `234` - `expect(screen.getAllByTestId('map-marker')).toHaveLength(2)`
- [x] Non-numeric lat/lon → block with "Coordenadas inválidas": `src/pages/NovaAnalisePage.test.tsx:250` - `toHaveTextContent('Coordenadas inválidas')`

---

## Discrimination Sensor

**Baseline porcelain** (real tree, pre-sensor): `` (empty)

**Scratch**: temporary `git worktree add` under `%TEMP%` at `HEAD`, `node_modules` junction to main repo.

**Execution note**: Vitest 3 on Windows does not register suites when the runner cwd is the junctioned worktree (`No test suite found`). Faults were injected on scratch copies; each mutant was verified by running `npx vitest run` against the corresponding test file with immediate source restore (`git checkout --` on mutated paths). **Post-sensor porcelain** (tracked paths): unchanged from baseline; untracked `public/` may appear after `npm run build` (build artifact, not sensor mutation).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `src/components/CampaignMap.tsx:31` | Removed `.replace('.', '')` from `formatPointDate` (popup date wrong) | ✅ Killed (`CampaignMap.test.tsx`: 1 failed / 9 passed) |
| M2 | `src/components/CampaignMap.tsx:155` | `{false && points.map(...)}` hides all markers when heatmap path active | ✅ Killed (`CampaignMap.test.tsx`: 6 failed / 4 passed) |
| M3 | `src/domain/campaignMap.ts:14` | Flipped `isMarkerFilled` (`!== 'entered'`) | ✅ Killed (`campaignMap.test.ts`: 2 failed / 8 passed) |

**Sensor depth**: lightweight (3 behavior mutations, incl. popup date + heatmap/marker coupling)
**Sensor outcome**: 3/3 killed, 0 survived

Worktree removed via `git worktree remove --force`.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code / surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ |
| Per-layer coverage expectation | ✅ domain 1:1; pages/API covered |
| Tests map to requirements | ✅ |
| Documented guidelines | `package.json` vitest + build gate |

---

## Gate Check

- **Gate command**: `npm run build; npm test`
- **Gate outcome**: 161 passed, 0 failed, 0 skipped; `tsc -b && vite build` succeeded
- **Test count before feature** (`fa56ced`, `git grep "it('" -- "*.test.*"`): **116**
- **Test count after feature**: **161**
- **Delta**: **+45**
- **Skipped tests**: none
- **Failures**: none

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| CMAPF-01 | Pending | ✅ Verified |
| CMAPF-02 | Pending | ✅ Verified |
| CMAPF-03 | Pending | ✅ Verified |
| CMAPF-04 | Pending | ✅ Verified |
| CMAPF-05 | Pending | ✅ Verified |

---

## Summary

**Overall verdict**: PASS ✅

**Spec-anchored check**: 19/19 AC rows with evidence; 1 spec-precision gap (not-found punctuation)

**Sensor**: 3/3 mutations killed

**Gate**: 161 passed; build OK

**What works**: Upload campaign/position flow, API FormData shape, dedupe, map styling and popup, heatmap toggle with markers visible, tile-failure resilience (mocked), map page states, Home KPI, result location row.

**Issues found**: None blocking re-verification (prior gaps closed in `e0e300b`).

**Next steps**: None for Verifier; optional spec copy alignment for not-found message punctuation.
