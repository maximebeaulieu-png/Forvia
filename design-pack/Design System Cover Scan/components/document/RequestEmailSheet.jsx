import React from "react";
import { Sheet } from "../base/Sheet.jsx";
import { Input } from "../base/Input.jsx";
import { Button } from "../base/Button.jsx";
import { Icon } from "../base/Icon.jsx";

export function buildRequestEmail({ supplier, contact = "Sir or Madam", policyNumber, insurer, validUntil, formalPoints = [], coveragePoints = [], dueDate, buyer = "FORVIA Purchasing" }) {
  const block = (title, lines) => lines.length ? `${title}\n${lines.map(l => `- ${l}`).join("\n")}\n\n` : "";
  return `Subject: FORVIA — insurance certificate for ${supplier}: corrections required

Dear ${contact},

As part of FORVIA's supplier qualification, we reviewed the insurance certificate you provided
(policy ${policyNumber || "—"}, ${insurer || "—"}, valid until ${validUntil || "—"}). To be accepted under FORVIA's General Purchasing
Terms and Conditions, the following points must be addressed:

${block("Formal requirements", formalPoints)}${block("Coverage requirements (per FORVIA GPTC)", coveragePoints)}Please send an updated certificate via SAP Ariba by ${dueDate || "—"}. Do not hesitate to forward this message to your insurer or broker.

Kind regards,
${buyer} — FORVIA Purchasing`;
}

/** Capitalized alias — the bundle namespace only exposes capitalized exports. */
export const BuildRequestEmail = buildRequestEmail;

export function RequestEmailSheet({ open, onClose, email, onChange, onCopy, onDownload, supplier, style }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(email || "");
    setCopied(true); setTimeout(() => setCopied(false), 1600);
    onCopy && onCopy();
  };
  return (
    <Sheet open={open} onClose={onClose} width={560} style={style}
      title="Request changes"
      subtitle={`Generated from the findings${supplier ? ` · ${supplier}` : ""} · editable · nothing is sent in the POC`}
      footer={<>
        <Button iconLeft={<Icon name="copy" size={14} />} onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
        <Button variant="primary" iconLeft={<Icon name="download" size={14} />} onClick={onDownload}>Download .eml</Button>
      </>}>
      <Input multiline rows={22} mono value={email} onChange={onChange}
        style={{ fontSize: 12, lineHeight: 1.6, height: "100%", minHeight: 420 }} />
      <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 10, lineHeight: 1.45 }}>
        Every bracketed point comes from a finding. Editing the text here does not change the analysis.
      </p>
    </Sheet>
  );
}
