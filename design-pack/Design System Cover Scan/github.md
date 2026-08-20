repo: maximebeaulieu-png/Forvia
branch: main
path: design-pack

## Last sync
date: 2026-08-20T15:20:00Z

### Updated in this project
- Imported the CoverScan design pack: brief, tokens, dashboard spec, demo script, the 10 real certificates.
- Copied four real certificate page scans into `assets/pages/`, plus the official FORVIA logo files supplied by the user.
- Rebranded to the forvia.com palette (#0A23CA / #8390E4 / #01003D), light theme, pill buttons, icon tiles.
- Built the token layer, 21 foundation cards, 29 components and the six-screen CoverScan UI kit.

## Screen map
| Project file | Built from |
|---|---|
| `tokens/*.css`, `styles.css` | `design-pack/01_design_tokens.md` |
| `guidelines/*.card.html` | `design-pack/01_design_tokens.md`, `design-pack/00_CLAUDE_DESIGN_BRIEF.md` |
| `components/verdict/*`, `components/coverage/*`, `components/document/*` | `design-pack/01_design_tokens.md` (component table), `design-pack/02_dashboard_spec.md` |
| `components/base/*` | `design-pack/01_design_tokens.md` (shadcn base) |
| `ui_kits/coverscan/PortfolioScreen.jsx` | `design-pack/02_dashboard_spec.md` §Screen 1 |
| `ui_kits/coverscan/CertificatesScreen.jsx` | `design-pack/02_dashboard_spec.md` §Screen 2 |
| `ui_kits/coverscan/CertificateScreen.jsx` | `design-pack/02_dashboard_spec.md` §Screen 3, `design-pack/03_demo_user_journey.md` §D |
| `ui_kits/coverscan/MidFiScreens.jsx` | `design-pack/02_dashboard_spec.md` §Screens 4–6 |
| `ui_kits/coverscan/data.js` | `design-pack/04_real_content_10_certificates.md`, `design-pack/00_CLAUDE_DESIGN_BRIEF.md` §5 |
| `assets/pages/*.jpeg` | `design-pack/sample-pages/` |
| `assets/icons/*.svg` | lucide-icons/lucide@main `icons/` |
