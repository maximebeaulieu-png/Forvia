"use client";

/**
 * Batch upload panel — demo replay of the 8-step pipeline for several files at
 * once. Each supported file advances through PIPELINE_STEPS with the same
 * timings as the single-certificate replay (max(220, t/6) ms per step), spread
 * out per file (staggered ~400 ms starts, deterministic ±15% duration jitter)
 * so the card reads as parallel processing. Files are never read: each row
 * resolves onto a cached certificate, cycling over the 10 demo certificates.
 */

import * as React from "react";
import Link from "next/link";
import { FileText, X } from "lucide-react";
import { DecisionChip, PIPELINE_STEPS } from "@/components/coverscan";
import { getCertificates } from "@/lib/repository";
import type { BatchFile } from "@/lib/upload-batch";

/** Hard cap — beyond this the extra files are acknowledged but not replayed. */
export const BATCH_MAX_FILES = 20;

/** Same accepted types as the upload pickers. */
const SUPPORTED_RE = /\.(pdf|png|jpe?g)$/i;

/** Per-step replay timings (ms) from the ui_kit mock — same base as the single replay. */
const BASE_TIMINGS = [420, 3100, 900, 6400, 700, 1500, 300, 2600];

const STEP_COUNT = PIPELINE_STEPS.length;
const STAGGER_MS = 400;

/** Deterministic ±15% duration factor per file index — keeps rows from moving in lockstep. */
function jitterFactor(index: number): number {
  const u = ((index * 7919 + 104729) % 1000) / 1000; /* 0..1, stable per index */
  return 1 + (u - 0.5) * 0.3;
}

/** Duration of one step for one file: max(220, base/6) ms, scaled by the file's jitter. */
function stepDurationMs(step: number, fileIndex: number): number {
  return Math.round(Math.max(220, (BASE_TIMINGS[step] ?? 0) / 6) * jitterFactor(fileIndex));
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

const ROW_GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "16px minmax(160px, 260px) 1fr",
  alignItems: "center",
  gap: 12,
  minHeight: 36,
  padding: "4px 0",
  borderTop: "1px solid var(--border)",
};

const FILE_NAME: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const focusRing =
  "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/* ------------------------------------------------------------- single row */

function BatchRow({
  file,
  fileIndex,
  cert,
  onDone,
}: {
  file: BatchFile;
  /** Index among the supported files — drives the stagger, jitter and cert mapping. */
  fileIndex: number;
  cert: { id: string; supplier: string; decision: React.ComponentProps<typeof DecisionChip>["decision"] };
  onDone: () => void;
}) {
  const [step, setStep] = React.useState(0);
  const done = step >= STEP_COUNT;

  /* Chained timers, one per step; the first also waits for the staggered start. */
  React.useEffect(() => {
    if (step >= STEP_COUNT) return;
    const delay = stepDurationMs(step, fileIndex) + (step === 0 ? fileIndex * STAGGER_MS : 0);
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step, fileIndex]);

  /* Report completion exactly once — step never moves past STEP_COUNT. */
  React.useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);

  const stepLabel = done ? "Done" : (PIPELINE_STEPS[step] ?? "");

  return (
    <div style={ROW_GRID}>
      <FileText size={14} strokeWidth={1.75} style={{ color: "var(--muted-foreground)" }} aria-hidden="true" />
      <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
        <span style={FILE_NAME} title={file.name}>{file.name}</span>
        <span className="cs-num" style={{ fontSize: 11, color: "var(--muted-foreground)", flex: "0 0 auto" }}>
          {formatSize(file.size)}
        </span>
      </span>
      {done ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifySelf: "start" }}>
          <DecisionChip decision={cert.decision} size="sm" />
          <Link
            href={`/certificates/${cert.id}`}
            className={focusRing}
            style={{ fontSize: 12, fontWeight: 500, color: "var(--primary)" }}
          >
            {cert.supplier}
          </Link>
        </span>
      ) : (
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            role="progressbar"
            aria-label={`${file.name} — analysis progress`}
            aria-valuemin={0}
            aria-valuemax={STEP_COUNT}
            aria-valuenow={step}
            aria-valuetext={stepLabel}
            className="h-1 flex-1 overflow-hidden rounded-xs bg-(--gap-track)"
          >
            <span
              className="block h-full bg-(--gap-fill) transition-[width] duration-(--dur-step) ease-(--ease-out) motion-reduce:transition-none"
              style={{ width: `${(step / STEP_COUNT) * 100}%` }}
            />
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              whiteSpace: "nowrap",
              flex: "0 0 132px",
            }}
          >
            {stepLabel}
          </span>
        </span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- panel */

export function BatchPanel({
  files,
  onDismiss,
}: {
  files: BatchFile[];
  onDismiss: () => void;
}) {
  const certs = React.useMemo(() => getCertificates(), []);
  const shown = files.slice(0, BATCH_MAX_FILES);
  const hiddenCount = files.length - shown.length;

  /* Supported files get a sequential index → stagger + deterministic cert cycle. */
  let supportedIndex = -1;
  const rows = shown.map((file) => {
    const supported = SUPPORTED_RE.test(file.name);
    if (supported) supportedIndex += 1;
    return { file, supported, index: supported ? supportedIndex : -1 };
  });
  const total = supportedIndex + 1;

  const [doneCount, setDoneCount] = React.useState(0);
  const onRowDone = React.useCallback(() => setDoneCount((n) => n + 1), []);
  const [dismissHover, setDismissHover] = React.useState(false);

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="Batch analysis"
      style={{
        background: "var(--card)",
        color: "var(--card-foreground)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: "12px 16px 10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          Analysing {total} certificate{total === 1 ? "" : "s"} — demo replay
        </span>
        <span className="cs-num" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {Math.min(doneCount, total)} of {total} analysed
        </span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onDismiss}
          onMouseEnter={() => setDismissHover(true)}
          onMouseLeave={() => setDismissHover(false)}
          className={focusRing}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 26,
            padding: "0 10px",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            color: "var(--foreground)",
            background: dismissHover ? "var(--accent)" : "transparent",
            border: "1px solid transparent",
            borderRadius: "var(--radius-full)",
            cursor: "pointer",
            transition: "background 120ms var(--ease-standard)",
          }}
        >
          <X size={13} strokeWidth={1.75} aria-hidden="true" />
          Dismiss
        </button>
      </div>

      <div>
        {rows.map((row, i) =>
          row.supported ? (
            <BatchRow
              key={`${row.file.name}-${i}`}
              file={row.file}
              fileIndex={row.index}
              cert={certs[row.index % certs.length]!}
              onDone={onRowDone}
            />
          ) : (
            <div key={`${row.file.name}-${i}`} style={{ ...ROW_GRID, color: "var(--muted-foreground)" }}>
              <FileText size={14} strokeWidth={1.75} aria-hidden="true" />
              <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
                <span style={{ ...FILE_NAME, fontWeight: 450 }} title={row.file.name}>
                  {row.file.name}
                </span>
                <span className="cs-num" style={{ fontSize: 11, flex: "0 0 auto" }}>
                  {formatSize(row.file.size)}
                </span>
              </span>
              <span style={{ fontSize: 11 }}>Unsupported format</span>
            </div>
          ),
        )}
      </div>

      {hiddenCount > 0 && (
        <div style={{ fontSize: 11, color: "var(--muted-foreground)", padding: "6px 0 0" }}>
          Showing the first {BATCH_MAX_FILES} of {files.length} files
        </div>
      )}

      <div
        style={{
          fontSize: 11,
          color: "var(--muted-foreground)",
          borderTop: "1px solid var(--border)",
          marginTop: 8,
          paddingTop: 8,
        }}
      >
        Demo replay — files are not read; each row replays a cached certificate. Live pipeline
        arrives with Sprint 1.
      </div>
    </section>
  );
}
