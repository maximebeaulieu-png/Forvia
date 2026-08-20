# Spec — Sprint 0 + écran Certificate analysis

**Date** : 2026-08-20 · **Statut** : validé par Maxime (design approuvé en session) · **Périmètre** : première phase d'implémentation du PoC CoverScan.

Sources : `docs/01–11`, `design-pack/` (specs identiques, diff vide), design system exporté `design-pack/Design System Cover Scan/`, ui_kit `ui_kits/coverscan/`.

---

## 1. Objectif et livrables

Construire le socle du PoC et le premier écran métier, consultables localement en une commande.

Livrables de fin de phase :
1. Monorepo qui builde (`pnpm build`) et se lance (`pnpm dev` → http://localhost:3000) **sans aucune dépendance externe** (pas de DB, pas de clé API requise pour naviguer).
2. Thème Tailwind alimenté par les tokens CSS du design system (source unique).
3. Composants shadcn re-stylés + composants signature CoverScan re-implémentés, exposés sur une page `/specimens` comparable aux cartes du design system.
4. Écran **Certificate analysis** (`/certificates/[id]`) alimenté par les données cached des 10 certificats réels ; cert 04 Marron = chemin de démo.
5. Client OCR AlphaEdge + probe (`pnpm ocr:probe`) exécuté, rapport commité dans `docs/eval/llm_probe.md`.
6. Docs mis à jour pour refléter les décisions (voir §9).

## 2. Décisions actées

| Décision | Choix | Quand |
|---|---|---|
| Stack front | **Ré-implémentation shadcn/Tailwind** ; le design system exporté est la **référence visuelle** (tokens, contrats `.d.ts`, labels verrouillés, ui_kit comme blueprint). Ses `.jsx` ne sont pas importés tels quels. | 20/08, Maxime |
| Tokens | Les 8 fichiers `tokens/*.css` du DS copiés tels quels (nommage déjà shadcn-compatible : `--background`, `--card`, `--primary`…) ; le thème Tailwind ne référence que `var(--…)`. Aucun hex/px brut dans les composants. | 20/08 |
| AlphaEdge | **API OCR uniquement** (pas de LLM au catalogue). Slug par défaut `alpha-digit-max` (validé en session : HTTP 200, confiance 0.98, 5,5 s/page, fidélité mots 0.80 vs référence ; `medium` : 0.88 / 1,55 s / 0.73). | 20/08, testé |
| Mode pipeline | `LLM_MODE=text-first` devient le **mode principal** (OCR → texte → extraction), non plus le mode dégradé. | 20/08 |
| LLM de raisonnement | **Différé à la phase pipeline.** Interface `reason` neutre dès maintenant ; candidat par défaut Claude/Anthropic avec caveat souveraineté à assumer dans l'offre (§4.4 : l'OCR, où transitent les documents, reste hébergé FR). | 20/08 |
| Horloge démo | **2025-04-15** partout (valeur du ground truth et du récit « Chubb 46 days left ») ; corriger le `2025-03-15` de `CLAUDE.md`. | 20/08 |
| Icônes / fonts | `lucide-react` (même set que les 45 SVG du pack) ; Inter + JetBrains Mono self-hostées via `next/font`, `tabular-nums` sur les chiffres. | 20/08 |
| DB | **Aucune cette phase.** Repository JSON derrière une interface ; Drizzle/Postgres en phase suivante sans toucher l'UI. | 20/08 |
| Orchestrateur | TS pur (phase pipeline ; Mastra écarté sauf besoin démontré). | CLAUDE.md |

## 3. Architecture

```
forvia-coverscan-poc/
  apps/web/                     Next.js App Router, TypeScript
    app/
      page.tsx                  → redirige vers /certificates/04-marron-mts
      certificates/[id]/        écran Certificate analysis
      specimens/                page de spécimens composants
      api/certificates/         GET list + GET by id (sert le contrat Certificate)
    components/ui/              primitives shadcn installées
    components/coverscan/       composants signature re-implémentés
    styles/                     tokens/*.css copiés du DS + entrée globale
    lib/                        repository cached, formatters (montants minor units, dates)
  packages/schemas/             zod : contrat Certificate, enums globaux (statuts, conformité, sévérités)
  packages/llm/                 src/ocr/ client AlphaEdge + probe ; src/reason/ interface stub
  packages/rules/               squelette + README (phase suivante)
  packages/pipeline/            squelette + README (phase suivante)
  packages/db/                  squelette + README (phase suivante)
  pnpm-workspace.yaml, turbo.json, vitest partagé
```

Versions : Next.js et React stables courantes au moment du scaffold ; Tailwind v4 ; composants interactifs en `"use client"`.

## 4. Design system → code

- `styles.css` + `tokens/*.css` copiés **à l'identique** (y compris `[data-theme=dark]`, non exposé dans l'UI cette phase).
- shadcn init branché sur ces variables ; primitives installées : button, badge, card, table, tabs, sheet, tooltip, input, select, progress, accordion.
- Composants signature re-implémentés en `.tsx` d'après `components/**/*.d.ts` + `*.prompt.md` du DS (contrats de props et labels **verrouillés**, ex. DecisionChip ne dit jamais « Rejected ») :
  DecisionChip, GapBar, ScoreRing, ConfidenceDot, StatusMiniGrid, VerificationSeal, CoverageGrid, FindingsList, KpiCard, DocumentViewer (surlignage evidence), ProcessingStepper, ProfileSwitcher, RequestEmailSheet, MaskedText.
- `/specimens` reproduit les cartes `base/coverage/document/verdict.card.html` du DS pour comparaison visuelle côte à côte.
- Discipline d'adhérence : tokens uniquement (pas d'hex/px bruts dans `components/`) — vérifiée en revue, l'oxlint du DS n'étant pas branchable sur du Tailwind.

## 5. Données (mode cached)

- Contrat `Certificate` complet typé en zod dans `packages/schemas`, conforme à docs/08 (pages, extraction, normalized, verification, scoring avec breakdown, explanation, audit) ; provenance obligatoire sur chaque montant ; devises en minor units + ISO.
- Source : fusion des 10 `data/samples/*/expected.json` + `ui_kits/coverscan/data.js` (grilles complètes pour 01 Chubb, 04 Marron, 06 Zurich ES ; les 7 autres restent table-level → l'écran affiche ce qui existe, sans données inventées).
- Repository `CertificateRepository` (list, getById) — implémentation JSON cette phase, implémentation Drizzle plus tard derrière la même interface.
- `referenceDate` = 2025-04-15 injectée par config, jamais `new Date()`.
- ProfileSwitcher : **visible mais inactif cette phase** (tooltip « Recalcul au Sprint 1 ») — vérifié : les `expected.json` ne contiennent que le breakdown `FORVIA_GPTC_DEFAULT`, pas celui du profil Expert ; le recalcul live arrive avec `packages/rules`.

## 6. OCR AlphaEdge (`packages/llm`)

- Client : POST `{base}/models/{slug}/ocr`, multipart champ `image`, header `X-API-Key` ; retry avec backoff (tolérance cold start ~600 ms) ; throttle 60 req/min ; cache disque des réponses (les pages ne changent jamais).
- Config : `.env.local` (existant, gitignoré) — `ALPHAEDGE_BASE_URL`, `ALPHAEDGE_API_KEY`, `ALPHAEDGE_OCR_MODEL=alpha-digit-max`.
- `pnpm ocr:probe` : passe les ~26 pages des 10 samples en `max` (+ `medium` en comparatif), mesure latence/confiance/fidélité vs les `.txt` de référence, teste `enable_bbox` sur une page, écrit `docs/eval/llm_probe.md`. Coût total < 0,05 €.
- Contrainte notée pour la phase pipeline : 5,5 s/page en Max ⇒ OCR des pages en parallèle pour tenir le budget < 30 s/certificat.

## 7. Écran Certificate analysis

- Route `certificates/[id]`, composition d'après `ui_kits/coverscan/CertificateScreen.jsx` et docs/05 : split view (DocumentViewer gauche : pages JPEG + surlignage evidence ; panneau d'analyse droite), en-tête avec DecisionChip lg + ScoreRing + VerificationSeal, les 5 onglets de docs/05 (**Summary** par défaut avec verdict 3 phrases, verification seal, coverage grid, score ring, findings · **Extracted data** · **Exclusions & territory** · **History** · **Audit**), panneau de décision, RequestEmailSheet (contenu généré depuis les findings cached).
- Les 6 états de l'écran couverts par les 10 certificats (GO, REQUEST_CHANGES, NO_GO formel, NO_GO structurel, NEEDS_REVIEW, PROCESSING via ProcessingStepper statique).
- Interactions de la phase : navigation onglets, clic finding → scroll vers l'evidence (quote + page ; bbox si présent dans les données), MaskedText avec reveal (log console en attendant l'audit trail), navigation entre les 10 certs.
- Anglais uniquement, desktop 1440 (plancher 1280).

## 8. Validation — definition of done

- `pnpm build` passe ; `pnpm dev` = une commande, zéro config.
- TDD (vitest) sur la logique : géométrie GapBar (found/required, statuts hatched/empty), mapping décision→label verrouillé, seuils ConfidenceDot (●≥0.85 ◐0.6–0.85 ○<0.6), formatage montants (minor units → affichage), repository.
- Les décisions et labels affichés pour les 10 certs = `ground_truth.json`, vérifié par un test.
- `/specimens` validé visuellement contre les cartes du DS.
- Focus ring visible partout, statuts jamais couleur seule (icône + mot), contrastes AA tenus par les tokens.
- Probe OCR exécuté, rapport commité.

## 9. Mises à jour de docs incluses

- `docs/07` : AlphaEdge = OCR REST (multipart, X-API-Key), text-first = mode principal, chiffres du test du 20/08.
- `docs/08` : décision front actée (DS = référence visuelle, ré-implémentation shadcn/Tailwind) ; repository JSON avant Drizzle.
- `docs/09` : C7 complété (AlphaEdge = OCR seul ; LLM de raisonnement = décision ouverte, candidat Anthropic avec caveat §4.4).
- `CLAUDE.md` : horloge démo 2025-04-15 ; réalité de l'API AlphaEdge.
- `.env.example` : réécrit (variables OCR réelles, suppression `ALPHAEDGE_MODEL/VISION_MODEL`, `DATABASE_URL` déplacé en commentaire « phase suivante »).

## 10. Hors scope de cette phase

Moteur de règles, pipeline live, DB/seed/Postgres, écrans Portfolio/Certificates/Supplier 360/Requirements/Integrations/Review queue, thème sombre exposé, envoi d'emails, export Excel, payload Ariba, 140 certificats synthétiques, choix du LLM de raisonnement.

## 11. Risques

| Risque | Mitigation |
|---|---|
| Dérive visuelle vs design system | `/specimens` en gate de comparaison ; tokens seuls autorisés |
| Données partielles (7 certs table-level) | Démo garantie sur 01/04/06 complets ; affichage honnête du partiel |
| OCR lent (5,5 s/page) | Sans impact cette phase (cached) ; parallélisation prévue au pipeline |
| React 19/RSC vs patterns du ui_kit | Ré-implémentation native (pas d'import des .jsx), interactifs en `use client` |
