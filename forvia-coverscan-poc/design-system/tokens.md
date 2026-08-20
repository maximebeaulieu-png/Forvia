# Design tokens — CoverScan (shadcn/ui)

Direction: **an underwriter's desk, not a SaaS landing page.** Dense, calm, document-first. The interface is a reading instrument: the original certificate on one side, FORVIA's standard grid on the other. Colour is reserved for status; everything else is ink on paper. The one aesthetic risk: a **typographic numerals voice** — every monetary figure is set in a tabular, slightly condensed mono-style face so "€305,000" and "€15,000,000" line up and the gap is visible before you read it.

shadcn base: `neutral` palette, `radius: 0.375rem`, light theme default, dark theme supported (Group Insurance screens at night). Tailwind CSS variables below override `globals.css`.

## Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#F7F7F5` (warm paper) | `#0F1115` | app background |
| `--card` | `#FFFFFF` | `#161A21` | panels, grid |
| `--foreground` | `#14181F` (ink) | `#E8E9EC` | text |
| `--muted-foreground` | `#5D6470` | `#9AA2AF` | labels, captions |
| `--border` | `#E3E4E0` | `#262B34` | hairlines |
| `--primary` | `#0E2A47` (deep navy — trust, regulators, FORVIA-compatible) | `#9DB8D9` | primary buttons, active nav, links |
| `--primary-foreground` | `#FFFFFF` | `#0F1115` | |
| `--accent` | `#E9EEF5` | `#1E2633` | hover, selected row |
| `--ring` | `#2F6FB0` | `#6FA3E0` | focus ring (visible, 2 px) |
| **Status** `--status-go` | `#1E7F4F` / bg `#E6F4EC` | `#3FBF7F` / bg `#15302A` | Compliant |
| `--status-amber` | `#B26B00` / bg `#FFF3DF` | `#E0A23C` / bg `#33260E` | Request changes, warnings |
| `--status-red` | `#B3261E` / bg `#FBE9E7` | `#E5726B` / bg `#3A1A18` | Not admissible, block, critical |
| `--status-review` | `#5B3FA6` / bg `#EEE9FA` | `#A68CF0` / bg `#271F3D` | Needs review |
| `--status-neutral` | `#6B7280` / bg `#F1F2F4` | `#9CA3AF` / bg `#1F242C` | Pending, processing, info |
| `--evidence` | `#F5C451` @ 35 % | `#F5C451` @ 30 % | highlight rectangles on the document |
| `--required-marker` | `#14181F` | `#E8E9EC` | threshold tick on gap bars |

Rules: status colour always paired with icon + text. Never use red/green alone on the gap bar — the bar is ink; the label carries the status colour. Max two accent colours per screen besides status.

## Typography

| Role | Face | Size / weight | Notes |
|---|---|---|---|
| UI body | `Inter` (system fallback) | 14 px / 400, 1.45 | dense tables at 13 px |
| Headings | `Inter` 600, tight tracking (−0.01em) | h1 22, h2 18, h3 15 | no display serif — this is a tool |
| **Numerals & codes** | `JetBrains Mono` (or `IBM Plex Mono`) with `font-variant-numeric: tabular-nums` | 13–14 px | all amounts, policy numbers, dates in tables, rule ids |
| Big numbers (KPI, score) | `JetBrains Mono` 600 | 32–40 px | the signature voice |
| Document quotes (evidence) | italic, muted, source language | 13 px | never translated |

## Spacing & density
4-px grid. Table rows 36 px (dense mode 32). Card padding 16. Split view gutter 8 with a draggable handle. Max content width: none (desktop tool, min 1280). Sidebar 232 px, collapsible to 56.

## Components (shadcn primitives → CoverScan components)

| CoverScan component | Built from | Spec |
|---|---|---|
| `DecisionChip` | `Badge` | size `lg` in header (28 px), `sm` in tables; icon left; outline variant for FORMAL_DEFECT |
| `VerificationSeal` | custom SVG + `Tooltip` | 8 ticks around a circle (gates); ✓ go / ✗ red / ? review; centre shows "Admissible" or "Not admissible"; 96 px in header, 40 px in tables |
| `CoverageGrid` | `Table` | sticky header; row = guarantee; status cell; `GapBar` cell; confidence dot cell |
| `GapBar` | custom | 0→required scale, 6 px tall, ink fill for found, black tick at required; label right `€305k · 2 %`; hatched fill for COVERED_NO_AMOUNT; empty with "missing" label |
| `ConfidenceDot` | custom + `Tooltip` | ● ≥ 0.85, ◐ 0.6–0.85, ○ < 0.6; tooltip shows source page/quote |
| `FindingsList` | `Accordion` + `Badge` | severity chips BLOCK/CRITICAL/WARNING/INFO; body: rule id (mono), evidence quote, fix suggestion |
| `DocumentViewer` | custom (page images) + `ScrollArea` | thumbnails rail, zoom, highlight layer; evidence rectangles in `--evidence`; page language badge |
| `ProcessingStepper` | `Progress` + list | 8 steps, ms per step, total; reduced-motion: no animation, states only |
| `ScoreRing` | custom SVG | 0–100, ink ring, number in mono 600; greyed + "Provisional" when NO_GO |
| `ProfileSwitcher` | `Select` | header; changing it triggers client-side rescore with a subtle row recolour transition (150 ms) |
| `RequestEmailSheet` | `Sheet` + `Textarea` | editable email, Copy / Download .eml |
| `KpiCard` | `Card` | big mono number, label, sub-line, optional ring |
| `StatusMiniGrid` | custom | three 16-px cells PL / Recall / PFL in table rows |
| `MaskedText` | custom | personal data masked `n.•••@polyvlies.de` with reveal (logged) |

## Motion
Only: stepper progression, row recolour on profile switch, highlight pulse (300 ms) when evidence is clicked. Nothing decorative. `prefers-reduced-motion` disables all three.

## Iconography
`lucide-react`: ShieldCheck, ShieldAlert, ShieldX, Eye, FileQuestion, Stamp (use `Stamp` icon), PenLine (signature), Building2 (insurer), Hash (policy no.), CalendarClock, Globe, Coins, ArrowUpRight.

## Charts (Recharts)
Ink greys for structure; status colours for stacked segments; no gradients; tabular-nums on axes; tooltips show found vs required with currency.

## Copy rules
Sentence case everywhere. Verbs on buttons. Numbers: `€20,000,000` in grid, `€20M` in charts and chips. Dates `31 May 2025`. "Not admissible" never "Rejected" (rejection is a human action).
