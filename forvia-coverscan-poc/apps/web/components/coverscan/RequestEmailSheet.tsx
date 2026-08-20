"use client";

import * as React from "react";
import { Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface RequestEmailSheetProps {
  open?: boolean;
  onClose?: () => void;
  /** the full email text, including the Subject line */
  email?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCopy?: () => void;
  onDownload?: () => void;
  /** shown in the subtitle */
  supplier?: string;
  style?: React.CSSProperties;
}

export interface BuildRequestEmailInput {
  supplier: string;
  contact?: string;
  policyNumber?: string;
  insurer?: string;
  validUntil?: string;
  /** issuer, signature, stamp, contracting entity */
  formalPoints?: string[];
  /** one line per guarantee gap, with the required level and what was found */
  coveragePoints?: string[];
  dueDate?: string;
  buyer?: string;
}

/** Renders the approved template; only findings feed the bracketed parts. Keep the wording as approved. */
export function buildRequestEmail({
  supplier,
  contact = "Sir or Madam",
  policyNumber,
  insurer,
  validUntil,
  formalPoints = [],
  coveragePoints = [],
  dueDate,
  buyer = "FORVIA Purchasing",
}: BuildRequestEmailInput): string {
  const block = (title: string, lines: string[]) =>
    lines.length ? `${title}\n${lines.map((l) => `- ${l}`).join("\n")}\n\n` : "";
  return `Subject: FORVIA — insurance certificate for ${supplier}: corrections required

Dear ${contact},

As part of FORVIA's supplier qualification, we reviewed the insurance certificate you provided
(policy ${policyNumber || "—"}, ${insurer || "—"}, valid until ${validUntil || "—"}). To be accepted under FORVIA's General Purchasing
Terms and Conditions, the following points must be addressed:

${block("Formal requirements", formalPoints)}${block("Coverage requirements (per FORVIA GPTC)", coveragePoints)}Please send an updated certificate via SAP Ariba by ${dueDate || "—"}. Do not hesitate to forward this message to your insurer or broker.

Kind regards,
${buyer} — FORVIA Purchasing`;
}

/** Same function under a capitalized name — use this when reading from the window namespace. */
export const BuildRequestEmail = buildRequestEmail;

/**
 * The generated supplier email. Editable, copyable, downloadable as .eml — never sent from the POC.
 */
export function RequestEmailSheet({
  open,
  onClose,
  email,
  onChange,
  onCopy,
  onDownload,
  supplier,
  style,
}: RequestEmailSheetProps) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(email || "");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    onCopy?.();
  };
  return (
    <Sheet
      open={!!open}
      onOpenChange={(o) => {
        if (!o) onClose?.();
      }}
    >
      <SheetContent
        side="right"
        className="w-[560px] gap-0 sm:max-w-[560px]"
        style={style}
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>Request changes</SheetTitle>
          <SheetDescription>
            {`Generated from the findings${supplier ? ` · ${supplier}` : ""} · editable · nothing is sent in the POC`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">
          <textarea
            aria-label="Generated email"
            rows={22}
            value={email}
            onChange={onChange}
            readOnly={!onChange}
            className="cs-num h-full min-h-[420px] w-full resize-y rounded-(--radius-sm) border border-input bg-card p-3 font-mono text-xs leading-[1.6] text-foreground focus-visible:outline-none"
          />
          <p className="mt-2.5 text-xs leading-[1.45] text-muted-foreground">
            Every bracketed point comes from a finding. Editing the text here does
            not change the analysis.
          </p>
        </div>
        <SheetFooter className="flex-row justify-end border-t border-border">
          <Button variant="outline" onClick={copy}>
            <Copy size={14} />
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button onClick={onDownload}>
            <Download size={14} />
            Download .eml
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
