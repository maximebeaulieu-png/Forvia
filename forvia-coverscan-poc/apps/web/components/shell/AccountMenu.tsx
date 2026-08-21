"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import type { DemoUser } from "@/lib/auth-demo";

export interface AccountMenuProps {
  /** Signed-in demo account — resolved server-side from the cs_session cookie. */
  user: DemoUser;
}

/** "Léa Fontaine" → "LF", "Arkan" → "AR". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters =
    parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return letters.toUpperCase();
}

/**
 * Header account menu — replaces the former profile + role switchers: the role now comes
 * from the account itself. Hand-rolled accessible popover (role="menu", Escape closes and
 * restores focus, Tab/arrows cycle inside, outside click closes).
 */
export function AccountMenu({ user }: AccountMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const menuItems = React.useCallback(
    () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
    [],
  );

  const close = React.useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  /* Focus the first item when the menu opens — the menu owns focus while it is up. */
  React.useEffect(() => {
    if (open) menuItems()[0]?.focus();
  }, [open, menuItems]);

  /* Outside press closes without stealing focus back. */
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (target instanceof Node && wrapperRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  function moveFocus(delta: number) {
    const items = menuItems();
    if (items.length === 0) return;
    const current = items.findIndex((item) => item === document.activeElement);
    const next = (current + delta + items.length) % items.length;
    items[next]?.focus();
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      /* Focus trap: Tab cycles through the menu items instead of leaving the menu. */
      event.preventDefault();
      moveFocus(event.shiftKey ? -1 : 1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(-1);
    }
  }

  async function signOut() {
    setOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* demo — leave anyway */
    }
    router.push("/login");
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account — ${user.name}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 28,
          padding: "0 8px 0 3px",
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--foreground)",
          background: open ? "var(--accent)" : "transparent",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-full)",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: "var(--radius-full)",
            background: "var(--secondary)",
            color: "var(--primary)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          {initials(user.name)}
        </span>
        <span style={{ fontWeight: 500 }}>{user.name}</span>
        <span style={{ color: "var(--muted-foreground)", display: "flex" }}>
          <ChevronDown size={14} />
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 50,
            minWidth: 240,
            padding: 4,
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-popover)",
            fontFamily: "var(--font-sans)",
          }}
        >
          <div
            role="presentation"
            style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 10px 10px" }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</span>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{user.email}</span>
            <span
              style={{
                alignSelf: "flex-start",
                marginTop: 2,
                padding: "1px 8px",
                fontSize: 11,
                fontWeight: 500,
                background: "var(--secondary)",
                color: "var(--primary)",
                borderRadius: "var(--radius-full)",
              }}
            >
              {user.role}
            </span>
          </div>
          <div
            role="separator"
            style={{ height: 1, margin: "2px 0", background: "var(--border)" }}
          />
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              height: 32,
              padding: "0 10px",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              textAlign: "left",
              color: "var(--foreground)",
              background: "transparent",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
