# FORVIA — POC « CoverScan » : analyse IA des attestations d'assurance fournisseurs

> Dossier de base complet pour **Claude Design** (maquettes + design system shadcn) et **Claude Code** (build du POC).
> Produit en anglais (client anglophone). Ce README est le seul fichier en français : c'est le guide de navigation.

*« CoverScan » est un nom de travail. À remplacer par le nom retenu par Arkan / Rejoice.*

---

## 1. Ce que contient ce dossier

| Chemin | Rôle | Pour qui |
|---|---|---|
| `00_CLAUDE_DESIGN_BRIEF.md` | **Brief à envoyer à Claude Design** : produit, écrans, parcours démo, données du dashboard, design system shadcn, critères de validation des maquettes | Claude Design, puis toute l'équipe |
| `CLAUDE.md` | Point d'entrée Claude Code : règles projet, stack, conventions, ordre de lecture des docs | Claude Code |
| `docs/01_business_context.md` | Sortie de l'**agent métier** : qui est Forvia, le « 90 k€/an », ce que fait concrètement le vérificateur, le vrai besoin | Tous |
| `docs/02_insurance_domain_knowledge.md` | Sortie de l'**agent assurance** : glossaire des garanties (FR/EN/DE/ES/IT), seuils, pièges, ce qu'il faut lire sur une attestation | Tous |
| `docs/03_ground_truth_samples.md` | Les 10 attestations exemples **annotées** (verdict expert Richard + verdict GPTC) = jeu d'évaluation du POC | Claude Code, QA |
| `docs/04_scoring_rules.md` | Spécification du moteur de règles : contrôles bloquants, seuils, formule des 2 scores, explicabilité | Claude Code |
| `docs/05_dashboard_spec.md` | Sortie de l'**agent orchestrateur** : architecture d'information, les 6 écrans, chaque KPI et colonne, effets « wow » | Claude Design, Claude Code |
| `docs/06_demo_user_journey.md` | Script de démo minute par minute + parcours utilisateurs (acheteur, Direction Assurances, admin) | Claude Design, commerce |
| `docs/11_check_catalogue.md` + `data/checks/check_catalogue.json` | **Le grand catalogue de cas** : 122 contrôles (nature du document, émetteur, entité, libellés de garanties, montants & sous-limites, exclusions, dates, qualité) avec indices multilingues, issue dans le modèle de décision, exemple, texte d'explication et correction à demander. Généré par `tools/build_check_catalogue.py`. | Claude Code (prompts + moteur de règles), Richard pour relecture |
| `docs/07_ai_pipeline.md` | Sortie de l'**agent IA** : comment le LLM lit une attestation (ingestion → OCR → extraction VLM → normalisation → vérifications déterministes → règles → explication) | Claude Code |
| `docs/08_architecture.md` | Stack, monorepo, modèle de données, API, intégration SAP Ariba (payload), mode démo / mode live | Claude Code |
| `docs/09_open_questions_and_assumptions.md` | Conflits entre sources, hypothèses posées, questions encore ouvertes (issues du fichier Questions Forvia) | Chef de projet |
| `docs/10_poc_roadmap.md` | Découpage en sprints aligné sur l'estimation (60 JH), critères de succès | Chef de projet |
| `schemas/` | JSON Schema de l'extraction, profil de seuils Forvia paramétrable, payload Ariba | Claude Code |
| `prompts/` | Prompts système versionnés (classification, extraction, explication, email fournisseur) | Claude Code |
| `design-system/tokens.md` | Tokens shadcn (couleurs de statut, typo, densité, composants) | Claude Design, Claude Code |
| `data/samples/` | Les 10 attestations (images de pages + texte) + `ground_truth.json` | Claude Code |
| `.claude/agents/` | 6 sous-agents Claude Code (métier, assurance, dashboard, IA, frontend, QA) | Claude Code |
| `.claude/commands/` | Commandes slash utiles (`/analyze-sample`, `/check-ground-truth`) | Claude Code |

## 2. Ordre de travail recommandé

1. **Claude Design** : envoyer `00_CLAUDE_DESIGN_BRIEF.md` + `design-system/tokens.md` + `docs/05_dashboard_spec.md` + `docs/06_demo_user_journey.md`. Valider les maquettes des 6 écrans (priorité absolue : écran 3 « Certificate Analysis » et écran 1 « Portfolio »).
2. **Claude Code** : ouvrir le dossier, `CLAUDE.md` s'applique automatiquement. Démarrer par `/check-ground-truth` puis suivre `docs/10_poc_roadmap.md` sprint par sprint.
3. **Cadrage client** : traiter `docs/09_open_questions_and_assumptions.md` avec Damien / Richard avant le sprint 2 (règles de scoring).

## 3. Les 5 décisions structurantes prises dans ce dossier

1. **Seuils paramétrables, pas codés en dur.** Les GPTC disent 20 M€ RC produits / 15 M€ rappel-PFL ; Richard juge avec ~5 M€ (habitudes Unibail). Les deux coexistent dans un « Requirements Profile » configurable (par pays / filiale / marché). La démo montre le profil GPTC par défaut et l'écart avec le jugement expert.
2. **Gate bloquant avant tout score.** Pas de tampon, pas de signature, pas de n° de police, émetteur = courtier/agent, document expiré, entité non contractante, assureur non identifié / non noté → **No-Go sans score** (règle validée par Richard, Q05). Le score ne s'applique qu'aux attestations « recevables ».
3. **Deux scores distincts** (Q23) : *Information Accuracy Score* = confiance d'extraction par champ ; *Risk Score* = adéquation des garanties. Toute alerte → revue humaine (≈ 10 % attendu).
4. **Le LLM ne décide pas.** Il extrait et explique. Les contrôles (dates, devises, seuils, registre assureurs, correspondance d'entité) sont déterministes et auditables. C'est ce qui rend le résultat défendable en cas de sinistre — et productisable en « tools » réutilisables (point de Vincent).
5. **Date de référence d'analyse paramétrable.** Les attestations exemples datent de 2024-2025 ; en août 2026 elles sont toutes expirées. Le POC analyse « à la date de réception » (défaut démo : **15/03/2025**) et historise le taux de change du jour (Q28-Q29).

## 4. Note sur vos notes

- « seuils sous seuil à 300 000 » : correspond à la sous-limite de **305 000 €** sur les *frais de retrait* et *dépose-repose* de l'attestation MTS / Marron & Associés (vs 15 M€ exigés) — c'est l'exemple parfait de sous-limite piège à montrer en démo. Le mot « inondations » est vraisemblablement une erreur de prise de note (aucune attestation ne mentionne de garantie inondation, hors périmètre RC).
- « transmis à leur SAP » : le payload de réinjection Ariba est spécifié dans `docs/08_architecture.md` §6 et `schemas/ariba_payload.schema.json`.

## 5. Points de vigilance avant la soutenance

- Aucune des 10 attestations fournies par Forvia n'est conforme en l'état (Richard : « la seule qui est bien c'est celle de Chubb, et encore »). Le dashboard doit rendre cela lisible **sans être anxiogène** : la valeur est dans le « Request changes » outillé (email fournisseur généré) autant que dans le No-Go.
- LLM : **endpoint hébergé en France fourni par AlphaEdge** (décision du 20/08/2026, accès API transmis dans Claude Code). Adaptateur `alphaedge` (OpenAI-compatible) par défaut ; `anthropic` uniquement en fallback de dev local. Premier jalon : `pnpm llm:probe` pour vérifier vision / JSON / contexte / débit (inconnues U1–U4 dans `docs/09`). Reste à confirmer avec Forvia que la résidence des données en France satisfait le §4.4 même si le modèle n'est pas open-weights.
- RGPD : les attestations contiennent des données nominatives (ex. email `n.damm@polyvlies.de` sur l'attestation Beyer). Prévoir masquage dans les exports et la démo.

---
*Dossier généré le 20/08/2026 à partir de : expression de besoins Forvia, transcription de la session du 17/08/2026 avec Richard Mekouar, fichier Questions Forvia (45 questions), estimation POC (60,1 JH), 10 attestations exemples.*
