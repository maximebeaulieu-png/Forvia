"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Eye,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Plug,
  SlidersHorizontal,
  Table,
  Users,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /**
   * Pathname prefix that marks the item active. `null` = never active from the
   * pathname (ui_kit parity: opening the Review queue highlights Certificates).
   */
  match: string | null;
  count?: number;
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Monitor",
    items: [
      { id: "portfolio", label: "Portfolio", href: "/portfolio", icon: LayoutDashboard, match: "/portfolio" },
      { id: "certificates", label: "Certificates", href: "/certificates", icon: Table, match: "/certificates" },
      { id: "review", label: "Review queue", href: "/certificates?view=Needs+review", icon: Eye, match: null, count: 16 },
    ],
  },
  {
    group: "Manage",
    items: [
      { id: "suppliers", label: "Suppliers", href: "/suppliers", icon: Users, match: "/suppliers" },
      { id: "requirements", label: "Requirements", href: "/requirements", icon: SlidersHorizontal, match: "/requirements" },
      { id: "integrations", label: "Integrations", href: "/integrations", icon: Plug, match: "/integrations" },
    ],
  },
];

/** CoverScan app-shell sidebar — logo, Monitor/Manage nav groups, collapse toggle. */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const w = collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)";
  return (
    <nav
      style={{
        width: w,
        flex: `0 0 ${w}`,
        borderRight: "1px solid var(--border)",
        background: "var(--card)",
        display: "flex",
        flexDirection: "column",
        transition: "width 150ms var(--ease-standard)",
      }}
    >
      <div
        style={{
          height: "var(--header-h)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {collapsed ? (
          <img src="/logo-mark.svg" alt="FORVIA" style={{ height: 16, display: "block" }} />
        ) : (
          <>
            <img src="/logo-wordmark.png" alt="FORVIA" style={{ height: 14, display: "block" }} />
            <span style={{ width: 1, height: 18, background: "var(--border)" }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>CoverScan</span>
          </>
        )}
      </div>
      <div style={{ padding: "12px 10px", display: "grid", gap: 4, flex: 1, alignContent: "start" }}>
        {NAV.map((g) => (
          <React.Fragment key={g.group}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  padding: "10px 10px 4px",
                }}
              >
                {g.group}
              </div>
            )}
            {collapsed && <div style={{ height: 8 }} />}
            {g.items.map((n) => {
              const active = n.match != null && (pathname === n.match || pathname.startsWith(`${n.match}/`));
              const IconCmp = n.icon;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  title={n.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    height: 36,
                    padding: "0 10px",
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "var(--primary)" : "var(--foreground)",
                    border: "none",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: 13,
                    fontWeight: active ? 600 : 450,
                    textAlign: "left",
                    width: "100%",
                    textDecoration: "none",
                    transition: "background 120ms var(--ease-standard)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "var(--muted)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = active ? "var(--accent)" : "transparent";
                  }}
                >
                  <IconCmp size={15} style={{ flex: "0 0 auto" }} />
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{n.label}</span>
                      {n.count != null && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 20,
                            height: 18,
                            padding: "0 5px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--status-review-bg)",
                            color: "var(--status-review)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {n.count}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          padding: 8,
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          alignItems: "stretch",
          gap: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          title="Collapse sidebar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 30,
            flex: 1,
            padding: "0 8px",
            background: "transparent",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            font: "inherit",
            fontSize: 12,
          }}
        >
          <PanelLeft size={15} />
          {!collapsed && "Collapse"}
        </button>
        <button
          type="button"
          title="Se déconnecter"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } catch {
              /* demo */
            }
            router.push("/login");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 30,
            width: collapsed ? "100%" : 30,
            flex: "0 0 auto",
            padding: 0,
            background: "transparent",
            border: "none",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            font: "inherit",
          }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </nav>
  );
}
