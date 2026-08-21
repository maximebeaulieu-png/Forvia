/**
 * Build apps/web/data/certificates.json — the cached certificate dataset
 * served by the JSON repository (zero-config dev, output committed).
 *
 * Merges, for each of the 10 sample certificates:
 *   base  = design-system `data.js` table row (window.CS.certificates[i])
 *   deep  = data/samples/<dir>/expected.json extraction fields
 *   pages = one entry per real JPEG in apps/web/public/pages/<id>_p<n>.jpeg
 *
 * Every merged object is validated with CachedCertificate.parse before the
 * file is written.
 *
 * Run from the repo root with tsx (needed for the schemas .ts import):
 *   pnpm exec tsx apps/web/scripts/build-cached-data.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(WEB_ROOT, "../..");
const DS_DATA_JS = path.resolve(
  REPO_ROOT,
  "../design-pack/Design System Cover Scan/ui_kits/coverscan/data.js",
);
const SAMPLES_DIR = path.join(REPO_ROOT, "data/samples");
const PAGES_DIR = path.join(WEB_ROOT, "public/pages");
const OUT_FILE = path.join(WEB_ROOT, "data/certificates.json");
const SCHEMAS_INDEX = path.resolve(REPO_ROOT, "packages/schemas/src/index.ts");

/** expected.json fields merged verbatim on top of the data.js row. */
const DEEP_FIELDS = [
  "guarantees",
  "exclusions",
  "deductibles",
  "fx",
  "territory",
  "trigger",
  "basisSummary",
  "computed",
  "accuracyScore",
];

/**
 * Verification-seal keys (VerificationSeal displays these 8) mapped to the
 * rule-engine gate names found in expected.json. Used only when the data.js
 * row carries no `gates{}` of its own — data.js gates win for display.
 */
const SEAL_FROM_RULE_GATES = {
  stamp: ["STAMP_PRESENT"],
  signature: ["SIGNATURE_PRESENT"],
  insurer: ["ISSUER_IS_INSURER", "INSURER_IDENTIFIED", "INSURER_RATING_FLOOR"],
  policyNumber: ["POLICY_NUMBER_PRESENT"],
  dates: ["DATES_PRESENT", "NOT_EXPIRED"],
  entity: ["ENTITY_MATCH"],
  coinsurance: ["COINSURANCE_COMPLETE"],
  documentType: ["DOCUMENT_IS_CERTIFICATE"],
};

const GATE_STATE_RANK = { na: 0, pass: 1, review: 2, fail: 3 };

/** "PASS" | "FAIL" | "REVIEW" | "NA" (expected.json) -> GateState. */
function toGateState(value) {
  const s = String(value).toLowerCase();
  return s in GATE_STATE_RANK ? s : "na";
}

/** Derive the 8-key seal record from expected.json rule gates (worst wins). */
function deriveSealGates(ruleGates) {
  const out = {};
  for (const [sealKey, sources] of Object.entries(SEAL_FROM_RULE_GATES)) {
    const states = sources
      .filter((g) => g in ruleGates)
      .map((g) => toGateState(ruleGates[g]));
    const worst = states.reduce(
      (a, b) => (GATE_STATE_RANK[b] > GATE_STATE_RANK[a] ? b : a),
      states.length > 0 ? states[0] : "na",
    );
    out[sealKey] = { state: worst };
  }
  return out;
}

/** Load the design-system IIFE dataset (assigns window.CS). */
async function loadCS() {
  globalThis.window = {};
  try {
    await import(pathToFileURL(DS_DATA_JS).href);
  } catch {
    const code = await fs.readFile(DS_DATA_JS, "utf8");
    new Function("window", code)(globalThis.window);
  }
  const CS = globalThis.window.CS;
  if (!CS || !Array.isArray(CS.certificates)) {
    throw new Error(`data.js did not assign window.CS.certificates (${DS_DATA_JS})`);
  }
  return CS;
}

/** Map "01".."10" -> parsed expected.json (sample dir prefix = cert id). */
async function loadExpectedById() {
  const byId = new Map();
  for (const entry of await fs.readdir(SAMPLES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const m = /^(\d{2})_/.exec(entry.name);
    if (!m) continue;
    const file = path.join(SAMPLES_DIR, entry.name, "expected.json");
    byId.set(m[1], JSON.parse(await fs.readFile(file, "utf8")));
  }
  return byId;
}

/** Map "01".."10" -> sorted page numbers of the real <id>_p<n>.jpeg files. */
async function loadPageNumbersById() {
  const byId = new Map();
  for (const name of await fs.readdir(PAGES_DIR)) {
    const m = /^(\d{2})_p(\d+)\.jpeg$/.exec(name);
    if (!m) continue;
    const list = byId.get(m[1]) ?? [];
    list.push(Number(m[2]));
    byId.set(m[1], list);
  }
  for (const list of byId.values()) list.sort((a, b) => a - b);
  return byId;
}

function mergeCertificate(base, expected, pageNumbers) {
  const merged = { ...base };

  for (const field of DEEP_FIELDS) {
    if (expected && expected[field] !== undefined) merged[field] = expected[field];
  }

  // Gates: the data.js seal gates win for display; certs without them get a
  // seal derived from the expected.json rule gates. The raw rule gates are
  // kept alongside under `ruleGates`.
  if (expected?.gates) {
    if (!merged.gates) merged.gates = deriveSealGates(expected.gates);
    merged.ruleGates = expected.gates;
  }

  // Pages: one entry per JPEG actually present in public/pages. Per-page lang
  // and ocrUsed come from the data.js row when it lists that page; language
  // falls back to expected.json `language[0]`.
  const basePages = Array.isArray(base.pages) ? base.pages : [];
  const langFallback = Array.isArray(expected?.language)
    ? expected.language[0]
    : undefined;
  merged.pages = pageNumbers.map((n) => {
    const basePage = basePages.find((p) => p.n === n);
    const page = { n, imageUrl: `/pages/${base.id}_p${n}.jpeg` };
    const lang = basePage?.lang ?? langFallback;
    if (lang !== undefined) page.lang = lang;
    if (basePage?.ocrUsed !== undefined) page.ocrUsed = basePage.ocrUsed;
    return page;
  });

  return merged;
}

/**
 * Doctrine sanitiser (client technical dossier §1.3: binary compliance at the
 * minimum). The design-pack demo dataset carries graded prose — "borderline
 * compliant", "best coverage in the batch" — which contradicts the rule that
 * anything under the minimum is simply non-compliant. Rewrite it at build time
 * so no screen has to paper over it at render time.
 */
const DOCTRINE_REWRITES = [
  [
    "CHF 20,000,000 converts to \u20ac20.8M \u2014 borderline compliant",
    "CHF 20,000,000 converts to \u20ac20.8M \u2014 at or above the \u20ac20M minimum",
  ],
  [
    "Best coverage in the batch \u2014 PL \u20ac50M, recall \u20ac10M",
    "Recall (frais de retrait) \u20ac10M against \u20ac15M required \u2014 under the minimum",
  ],
];

function sanitiseWording(value) {
  if (typeof value === "string") {
    let out = value;
    for (const [from, to] of DOCTRINE_REWRITES) out = out.split(from).join(to);
    return out;
  }
  if (Array.isArray(value)) return value.map(sanitiseWording);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitiseWording(v)]));
  }
  return value;
}

async function main() {
  let CachedCertificate;
  try {
    ({ CachedCertificate } = await import(pathToFileURL(SCHEMAS_INDEX).href));
  } catch (err) {
    console.error(
      "Could not import packages/schemas/src/index.ts — run this script with tsx:\n" +
        "  pnpm exec tsx apps/web/scripts/build-cached-data.mjs",
    );
    throw err;
  }

  const [CS, expectedById, pagesById] = await Promise.all([
    loadCS(),
    loadExpectedById(),
    loadPageNumbersById(),
  ]);

  const merged = CS.certificates
    .map((base) => {
      const expected = expectedById.get(base.id);
      if (!expected) throw new Error(`No data/samples/${base.id}_*/expected.json found`);
      const pageNumbers = pagesById.get(base.id);
      if (!pageNumbers || pageNumbers.length === 0) {
        throw new Error(`No public/pages/${base.id}_p<n>.jpeg files found`);
      }
      return mergeCertificate(base, expected, pageNumbers);
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const sanitised = merged.map(sanitiseWording);
  merged.length = 0;
  merged.push(...sanitised);

  for (const cert of merged) {
    try {
      CachedCertificate.parse(cert);
    } catch (err) {
      console.error(`Certificate ${cert.id} failed CachedCertificate validation`);
      throw err;
    }
  }

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${merged.length} certificates to ${path.relative(REPO_ROOT, OUT_FILE)}`,
  );

  // Aggregates for the Portfolio / Certificates screens (window.CS extras).
  const aggregates = {
    REQUIRED: CS.REQUIRED,
    portfolio: CS.portfolio,
    byCountry: CS.byCountry,
    gapByGuarantee: CS.gapByGuarantee,
    expiring: CS.expiring,
    profiles: CS.profiles,
    topRisks: CS.topRisks,
    audit: CS.audit,
  };
  const aggFile = path.join(WEB_ROOT, "data/aggregates.json");
  await fs.writeFile(aggFile, `${JSON.stringify(sanitiseWording(aggregates), null, 2)}\n`, "utf8");
  console.log(`Wrote aggregates to ${path.relative(REPO_ROOT, aggFile)}`);
}

await main();
