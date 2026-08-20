import type * as React from "react";

export interface PageHeadingProps {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Page title block — h1, optional subtitle and right-aligned actions (ui_kit PageHeading). */
export function PageHeading({ title, sub, actions }: PageHeadingProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "18px 24px 0" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: "var(--text-h1)" }}>{title}</h1>
        {sub && <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 4 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
    </div>
  );
}
