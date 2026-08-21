"use client";

/**
 * Dedicated upload space — a modal where the user composes a batch of
 * insurance certificates before launching the analysis. Drops and file-picker
 * selections are CUMULATIVE: several successive picks build one batch.
 * Launching stores the supported files' metadata (lib/upload-batch) and
 * navigates to /certificates?batch=1 where the batch panel replays the
 * pipeline — even for a single file, so progress is always visible in the
 * same place.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setBatch } from "@/lib/upload-batch";

/** Same cap as the certificates batch panel (BATCH_MAX_FILES). */
const MAX_FILES = 20;

/** Same accepted types as the page dropzone and the batch panel. */
const SUPPORTED_RE = /\.(pdf|png|jpe?g)$/i;
const ACCEPT = ".pdf,.png,.jpg,.jpeg";

interface PendingFile {
  name: string;
  size: number;
  supported: boolean;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

const FILE_NAME: React.CSSProperties = {
  fontSize: 13,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
};

export interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const router = useRouter();
  const [files, setFiles] = React.useState<PendingFile[]>([]);
  const [pickKey, setPickKey] = React.useState(0);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const supported = files.filter((f) => f.supported);
  const ready = Math.min(supported.length, MAX_FILES);
  const overCap = supported.length > MAX_FILES;

  /* Cumulative add — duplicates (same name + size) are ignored silently. */
  const addFiles = React.useCallback((incoming: ArrayLike<File>) => {
    setFiles((prev) => {
      const next = [...prev];
      for (const f of Array.from(incoming)) {
        if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
        next.push({ name: f.name, size: f.size, supported: SUPPORTED_RE.test(f.name) });
      }
      return next;
    });
  }, []);

  const removeAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const browse = () => inputRef.current?.click();

  /* Closing (Cancel, Escape, overlay, launch) discards the composed batch. */
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFiles([]);
      setDragOver(false);
    }
    onOpenChange(next);
  };

  const launch = () => {
    if (ready === 0) return;
    setBatch(supported.slice(0, MAX_FILES).map(({ name, size }) => ({ name, size })));
    router.push("/certificates?batch=1");
    handleOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "color-mix(in srgb, var(--foreground) 35%, transparent)",
          }}
        />
        <DialogPrimitive.Content
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 50,
            width: "min(600px, calc(100vw - 48px))",
            maxHeight: "calc(100vh - 48px)",
            overflowY: "auto",
            background: "var(--card)",
            color: "var(--card-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-popover)",
            padding: 24,
            fontFamily: "var(--font-sans)",
          }}
        >
          <DialogPrimitive.Title style={{ fontSize: "var(--text-h2)", fontWeight: 600 }}>
            Upload certificates
          </DialogPrimitive.Title>
          <DialogPrimitive.Description
            style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}
          >
            Add one or more insurance certificates (PDF, PNG, JPG) — up to {MAX_FILES} files.
          </DialogPrimitive.Description>

          {/* Hidden picker — "Browse files", the dropzone and Enter/Space all open it.
              Keyed remount after each pick: resetting input.value inside onChange breaks
              React's change tracking in real browsers (second selection is swallowed). */}
          <input
            key={pickKey}
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              setPickKey((k) => k + 1);
            }}
          />

          <div
            role="button"
            tabIndex={0}
            aria-label="Drop certificates here or browse files"
            onClick={browse}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                browse();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
            }}
            className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            style={{
              marginTop: 16,
              padding: "28px 16px",
              display: "grid",
              justifyItems: "center",
              gap: 10,
              textAlign: "center",
              cursor: "pointer",
              border: "1.5px dashed var(--border)",
              borderRadius: "var(--radius-lg)",
              background: dragOver ? "var(--accent)" : "var(--muted)",
              transition: "background 120ms var(--ease-standard)",
            }}
          >
            <Upload size={22} strokeWidth={1.75} style={{ color: "var(--muted-foreground)" }} aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Drop certificates here</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                browse();
              }}
            >
              Browse files
            </Button>
          </div>

          {files.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                margin: "12px 0 0",
                padding: 0,
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${f.size}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minHeight: 36,
                    padding: "4px 2px",
                    borderTop: "1px solid var(--border)",
                    color: f.supported ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  <FileText
                    size={14}
                    strokeWidth={1.75}
                    style={{ color: "var(--muted-foreground)", flex: "0 0 auto" }}
                    aria-hidden="true"
                  />
                  <span title={f.name} style={{ ...FILE_NAME, fontWeight: f.supported ? 500 : 450 }}>
                    {f.name}
                  </span>
                  <span
                    className="cs-num"
                    style={{ fontSize: 11, color: "var(--muted-foreground)", flex: "0 0 auto" }}
                  >
                    {formatSize(f.size)}
                  </span>
                  {!f.supported && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                        padding: "1px 8px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--muted)",
                        color: "var(--muted-foreground)",
                        flex: "0 0 auto",
                      }}
                    >
                      Unsupported
                    </span>
                  )}
                  <span style={{ flex: 1 }} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => removeAt(i)}
                  >
                    <X size={13} aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {overCap && (
            <div style={{ fontSize: 11, color: "var(--muted-foreground)", paddingTop: 6 }}>
              Only the first {MAX_FILES} files will be analysed
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              paddingTop: 12,
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div aria-live="polite" style={{ fontSize: 13, fontWeight: 600 }}>
                {ready} certificate{ready === 1 ? "" : "s"} ready
              </div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                Demo replay — files are not read; each certificate replays a cached analysis. Live
                pipeline arrives with Sprint 1.
              </div>
            </div>
            <span style={{ flex: 1 }} />
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={ready === 0} onClick={launch}>
              Analyse {ready} certificate{ready === 1 ? "" : "s"}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
