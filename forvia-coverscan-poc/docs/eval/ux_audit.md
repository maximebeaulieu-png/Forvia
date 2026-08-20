# UX-UI audit — 21/08/2026

Method: Playwright + axe-core (WCAG 2 A/AA) over 6 screens × 3 viewports (1280/1440/1680),
keyboard journey, upload journey end-to-end, screenshot diff against the Claude Design ui_kit mockups.

## Results after fixes

| Check | Result |
|---|---|
| axe violations (6 screens, WCAG A+AA) | **0** |
| Horizontal body overflow at 1280/1440/1680 | **0** on all screens |
| Console errors / failed requests | 0 / 0 |
| Keyboard: table row reachable + Enter opens certificate | ✓ (focus ring 2px visible) |
| Upload journey | dropzone + header button → simulated processing (cert 06), stepper 8 steps, URL cleaned |

## Fixed in this pass

1. **Dead dropzone** ("Drop a certificate here" did nothing) → functional drag & drop / click / keyboard,
   navigates to the simulated replay, honestly captioned "Demo replay … live pipeline arrives with Sprint 1".
2. **AA contrast**: `--status-go` 4.40→5.76:1 (#176B41), `--status-amber` 3.83→5.22:1 (#935900) —
   override layer in `globals.css`, DS token files untouched; required by docs/05 §accessibility.
3. **Scrollable regions not keyboard-focusable** (document canvas, analysis panel, coverage grid,
   certificates table, top-risks table) → `tabIndex=0` + `role="region"` + labels.
4. **Unnamed progressbars / unlabeled inputs** (Requirements) → aria-labels.
5. **1280 responsive**: coverage grid (min-width 540) now scrolls inside its own card; tab list
   scrolls instead of wrapping; header "Analysed in N s / accuracy %" no longer breaks mid-token;
   portfolio gap bars fluid full-width (also closer to the mockup); certificates table scrolls in-card.

## Known and accepted

- The processing stepper's "Extract (vision)" label comes from the DS `PIPELINE_STEPS` (locked);
  the real pipeline is text-first (OCR) — relabel at the pipeline sprint alongside real timings.
- Next.js dev indicator (black "N" badge) is dev-only, absent from production builds.
- Below 1280 the layout is out of contract (docs/05: desktop 1440, floor 1280).
