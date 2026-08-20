# CoverScan UI kit

The full desktop application at 1440 × 900, click-through. Open `index.html`.

## Screens

1. **Portfolio** — four KPIs, compliance by country (click a bar to filter), coverage gap by guarantee with gap bars, top 10 risks, expiring timeline, throughput strip. Labelled *Demo dataset: 10 real + 140 synthetic*.
2. **Certificates** — saved views (All · Needs review · Not admissible · Expiring · My suppliers), filters, upload drop zone, the queue table with status chip, insurer rating, PL/Recall/PFL mini-grid, score, accuracy dot, expiry.
3. **Certificate analysis** — the core. Document left, FORVIA grid right, five tabs, sticky decision panel.
4. **Supplier 360** — Metraton: change detection banner, certificates by year, policy numbers.
5. **Requirements profiles** — thresholds, gate severities, weights summing to 100, simulate on portfolio.
6. **Integrations** — SAP Ariba payload and sync, Excel export, registry and rates.

## The demo path

Portfolio → click the **Not admissible** KPI → open **M.T.S. SAS** → the verification seal shows broker-issued, no stamp, no signature → click the **€305,000** recall figure → page 2 scrolls and the exact line pulses → **Request changes** opens the generated email.

Two more moments worth showing: **Upload** in the header replays the 8-step processing stepper on the Zurich/COPO certificate; switching the profile to **Expert** recolours the CeramTec row from *Not admissible · resubmit* to *Request changes*.

## Data

`data.js` holds the 10 real FORVIA certificates from `design-pack/04_real_content_10_certificates.md` — names, insurers, verdicts, scores, accuracies and expiry dates are the real ones. Full coverage grids, findings, gates and evidence rectangles exist for certificates 01 (Chubb), 04 (Marron & Associés) and 06 (Zurich ES); the other seven carry table-level data only, matching the pages available in the pack.

Evidence rectangles were measured against the real page scans. Page 1 of the Marron certificate is not in the pack at full fidelity for the stamp region, so the `STAMP_MISSING` rectangle there is approximate.

## Structure

`AppShell.jsx` (sidebar, header, page headings) · `PortfolioScreen.jsx` · `CertificatesScreen.jsx` · `CertificateScreen.jsx` · `MidFiScreens.jsx` · `data.js`.

Screens compose the design-system components from `window.CoverScanDesignSystem_6debdf`; nothing is re-implemented locally.
