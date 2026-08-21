"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Clock, Eye, EyeOff, Search, Upload } from "lucide-react";
import { AccountMenu } from "@/components/shell/AccountMenu";
import { UploadDialog } from "@/components/shell/UploadDialog";
import type { DemoUser } from "@/lib/auth-demo";

export interface TopHeaderProps {
  /** Signed-in account, resolved server-side in app/(shell)/layout.tsx. */
  user: DemoUser | null;
}

/**
 * CoverScan app-shell header — search, demo clock, upload, theme, account menu.
 * Profile and role switchers were removed: the account carries the role.
 */
export function TopHeader({ user }: TopHeaderProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [searchFocus, setSearchFocus] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [uploadOpen, setUploadOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <header
      style={{
        height: "var(--header-h)",
        flex: "0 0 var(--header-h)",
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
      }}
    >
      <div style={{ width: 320 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            height: 28,
            padding: "0 10px 0 12px",
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-full)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            boxShadow: searchFocus ? "var(--focus-ring)" : "none",
          }}
        >
          <span style={{ color: "var(--muted-foreground)", display: "flex" }}>
            <Search size={14} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") router.push(`/certificates?q=${encodeURIComponent(query)}`);
            }}
            placeholder="Search supplier or policy number"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "inherit",
              font: "inherit",
              height: "100%",
              boxShadow: "none",
              padding: 0,
            }}
          />
        </div>
      </div>
      <span style={{ flex: 1 }} />
      <span
        title="All dates in the demo are computed against this reference date"
        style={{ fontSize: 11, color: "var(--muted-foreground)", display: "inline-flex", alignItems: "center", gap: 5 }}
      >
        <Clock size={12} />
        <span className="cs-num">15 Apr 2025</span>
      </span>
      {/* Opens the dedicated upload space — the batch is composed in the modal. */}
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <button
        type="button"
        title="Demo replay — the live pipeline lands in Sprint 1"
        onClick={() => setUploadOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          height: 28,
          padding: "0 10px",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          background: "var(--primary)",
          color: "var(--primary-foreground)",
          border: "1px solid var(--primary)",
          borderRadius: "var(--radius-full)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Upload size={14} />
        Upload
      </button>
      <button
        type="button"
        title="Toggle dark theme"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          height: 28,
          padding: "0 10px",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
          fontWeight: 500,
          background: "transparent",
          color: "var(--foreground)",
          border: "1px solid transparent",
          borderRadius: "var(--radius-full)",
          cursor: "pointer",
          transition: "background 120ms var(--ease-standard)",
        }}
      >
        {theme === "dark" ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      {user && <AccountMenu user={user} />}
    </header>
  );
}
