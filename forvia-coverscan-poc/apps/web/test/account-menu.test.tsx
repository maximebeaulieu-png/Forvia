import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { AccountMenu } from "../components/shell/AccountMenu";
import { TopHeader } from "../components/shell/TopHeader";
import { decodeSessionEmail, getDemoUser, getSessionUser } from "../lib/auth-demo";
import { createSessionValue } from "../lib/auth-session";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace, prefetch: vi.fn(), back: vi.fn() }),
}));

const USER = { email: "demo@forvia.com", name: "Damien Conchon", role: "Buyer" };

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  nav.push.mockReset();
  vi.unstubAllGlobals();
});

/** The open menu — queries stay scoped to it (the name also shows on the trigger). */
function openMenu(): HTMLElement {
  fireEvent.click(screen.getByRole("button", { name: /Account/ }));
  return screen.getByRole("menu", { name: "Account" });
}

describe("AccountMenu", () => {
  it("shows initials and the account name on the closed trigger", () => {
    render(<AccountMenu user={USER} />);
    expect(screen.getByText("DC")).toBeInTheDocument();
    expect(screen.getByText("Damien Conchon")).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens a menu with the name, the e-mail and the account role badge", () => {
    render(<AccountMenu user={USER} />);
    const menu = openMenu();
    expect(within(menu).getByText("Damien Conchon")).toBeInTheDocument();
    expect(within(menu).getByText("demo@forvia.com")).toBeInTheDocument();
    expect(within(menu).getByText("Buyer")).toBeInTheDocument();
    /* identity lines are plain text — the only actionable entry is Sign out */
    expect(within(menu).getAllByRole("menuitem")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Account/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("renders the role of the second demo account", () => {
    render(<AccountMenu user={{ email: "nouveau@forvia.com", name: "Arkan Reviewer", role: "Insurance analyst" }} />);
    const menu = openMenu();
    expect(within(menu).getByText("Insurance analyst")).toBeInTheDocument();
    expect(screen.getByText("AR")).toBeInTheDocument();
  });

  it("Sign out posts to /api/auth/logout then redirects to /login", async () => {
    render(<AccountMenu user={USER} />);
    const menu = openMenu();
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Sign out" }));

    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/login"));
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(fetchMock.mock.invocationCallOrder[0]).toBeLessThan(
      nav.push.mock.invocationCallOrder[0],
    );
  });

  it("still signs out when the logout call fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    render(<AccountMenu user={USER} />);
    fireEvent.click(within(openMenu()).getByRole("menuitem", { name: "Sign out" }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/login"));
  });

  it("focuses the first item on open, closes on Escape and restores focus", () => {
    render(<AccountMenu user={USER} />);
    const trigger = screen.getByRole("button", { name: /Account/ });
    const menu = openMenu();
    const signOut = within(menu).getByRole("menuitem", { name: "Sign out" });
    expect(document.activeElement).toBe(signOut);

    fireEvent.keyDown(menu, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("traps Tab inside the menu", () => {
    render(<AccountMenu user={USER} />);
    const menu = openMenu();
    const signOut = within(menu).getByRole("menuitem", { name: "Sign out" });
    fireEvent.keyDown(menu, { key: "Tab" });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(document.activeElement).toBe(signOut);
  });

  it("closes on an outside click", () => {
    render(<AccountMenu user={USER} />);
    openMenu();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("TopHeader", () => {
  it("keeps search, the demo clock and Upload, and shows the account menu", () => {
    render(<TopHeader user={USER} />);
    expect(screen.getByPlaceholderText("Search supplier or policy number")).toBeInTheDocument();
    expect(screen.getByText("15 Apr 2025")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Account/ })).toHaveTextContent("Damien Conchon");
  });

  it("no longer renders the profile switcher nor the role select", () => {
    render(<TopHeader user={USER} />);
    expect(screen.queryByText(/GPTC default/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Role")).not.toBeInTheDocument();
    expect(document.querySelector("select")).toBeNull();
    expect(screen.queryByRole("option", { name: "Buyer" })).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });
});

describe("demo accounts", () => {
  it("carries the name and the role of each account", () => {
    expect(getDemoUser("demo@forvia.com")).toEqual({
      email: "demo@forvia.com",
      name: "Damien Conchon",
      role: "Buyer",
    });
    expect(getDemoUser("  NOUVEAU@Forvia.com ")).toEqual({
      email: "nouveau@forvia.com",
      name: "Arkan Reviewer",
      role: "Insurance analyst",
    });
    expect(getDemoUser("intruder@forvia.com")).toBeNull();
  });

  it("resolves the user behind a cs_session cookie value", () => {
    const session = createSessionValue("demo@forvia.com");
    expect(decodeSessionEmail(session)).toBe("demo@forvia.com");
    expect(getSessionUser(session)?.name).toBe("Damien Conchon");
    expect(getSessionUser(undefined)).toBeNull();
    expect(getSessionUser("not-a-session")).toBeNull();
    expect(getSessionUser(createSessionValue("intruder@forvia.com"))).toBeNull();
  });
});
