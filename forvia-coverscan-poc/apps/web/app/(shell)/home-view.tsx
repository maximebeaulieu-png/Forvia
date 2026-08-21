"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutDashboard, Table, Upload, type LucideIcon } from "lucide-react";
import { UploadDialog } from "@/components/shell/UploadDialog";

/**
 * Landing screen: three large actions read left to right, nothing else.
 * The dense screens (portfolio, queue) stay one click away.
 */

const tileBase: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  minHeight: 156,
  padding: 20,
  textAlign: "left",
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-sm)",
  color: "inherit",
  font: "inherit",
  cursor: "pointer",
  transition: "background 120ms var(--ease-standard), transform 120ms var(--ease-standard), border-color 120ms var(--ease-standard)",
};

function TileInner({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <>
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "var(--radius)",
          background: "var(--secondary)",
          color: "var(--primary)",
        }}
      >
        <Icon size={20} />
      </span>
      <span style={{ display: "grid", gap: 4 }}>
        <span style={{ fontSize: "var(--text-h3)", fontWeight: "var(--weight-semibold)" }}>{title}</span>
        <span style={{ fontSize: "var(--text-dense)", color: "var(--muted-foreground)", lineHeight: "var(--lh-dense)" }}>
          {description}
        </span>
      </span>
    </>
  );
}

function hoverOn(el: HTMLElement) {
  el.style.background = "var(--accent)";
  el.style.borderColor = "var(--brand-light)";
  el.style.transform = "translateY(-2px)";
}
function hoverOff(el: HTMLElement) {
  el.style.background = "var(--card)";
  el.style.borderColor = "var(--border)";
  el.style.transform = "none";
}

const SECONDARY = [
  { label: "Review queue", href: "/certificates?view=Needs+review" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "Requirements", href: "/requirements" },
];

export function HomeView() {
  const [uploadOpen, setUploadOpen] = React.useState(false);

  return (
    <div style={{ padding: "max(48px, 8vh) 24px 48px", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "var(--text-h1)" }}>Welcome to Forvia</h1>
        <p style={{ marginTop: 6, color: "var(--muted-foreground)" }}>
          Supplier insurance certificates, checked in seconds. Start here.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          style={tileBase}
          onMouseEnter={(e) => hoverOn(e.currentTarget)}
          onMouseLeave={(e) => hoverOff(e.currentTarget)}
          onFocus={(e) => hoverOn(e.currentTarget)}
          onBlur={(e) => hoverOff(e.currentTarget)}
        >
          <TileInner icon={Upload} title="Upload certificates" description="Drop one or several policies for analysis" />
        </button>

        <Link
          href="/portfolio"
          style={tileBase}
          onMouseEnter={(e) => hoverOn(e.currentTarget)}
          onMouseLeave={(e) => hoverOff(e.currentTarget)}
          onFocus={(e) => hoverOn(e.currentTarget)}
          onBlur={(e) => hoverOff(e.currentTarget)}
        >
          <TileInner icon={LayoutDashboard} title="Portfolio" description="Exposure and compliance at a glance" />
        </Link>

        <Link
          href="/certificates"
          style={tileBase}
          onMouseEnter={(e) => hoverOn(e.currentTarget)}
          onMouseLeave={(e) => hoverOff(e.currentTarget)}
          onFocus={(e) => hoverOn(e.currentTarget)}
          onBlur={(e) => hoverOff(e.currentTarget)}
        >
          <TileInner icon={Table} title="Certificates" description="Find, review and decide" />
        </Link>
      </div>

      <nav
        aria-label="Other sections"
        style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 24, fontSize: "var(--text-caption)" }}
      >
        {SECONDARY.map((s) => (
          <Link key={s.href} href={s.href} style={{ color: "var(--muted-foreground)", borderBottom: "none" }}>
            {s.label}
          </Link>
        ))}
      </nav>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
