/**
 * Demo auth for the CoverScan POC — no real backend.
 *
 * Hard-coded accounts:
 * - demo@forvia.com / "CoverScan2026!"  → direct sign-in.
 * - nouveau@forvia.com (no password yet) → first-login flow: 2FA then password creation.
 *
 * A password created or reset during the session is kept in module memory
 * (server process) and accepted afterwards. The 2FA code is always "123456".
 */

export const DEMO_2FA_CODE = "123456";
export const SESSION_COOKIE = "cs_session";
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8h

export const PASSWORD_RULE_TEXT =
  "At least 10 characters, one lowercase, one uppercase, one digit, one special character";

/** Password policy for screens "Create your password" / "Reset password". */
export function isValidPassword(password: string): boolean {
  return (
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

/** Identity shown in the header account menu — the role comes from the account, not a switcher. */
export interface DemoUser {
  email: string;
  /** Display name, e.g. "Damien". */
  name: string;
  /** Account role, e.g. "Buyer" / "Insurance analyst". */
  role: string;
}

interface DemoAccount extends DemoUser {
  /** null = account exists but must create a password (first-login flow). */
  password: string | null;
}

const ACCOUNTS: DemoAccount[] = [
  { email: "demo@forvia.com", name: "Damien", role: "Buyer", password: "CoverScan2026!" },
  {
    email: "nouveau@forvia.com",
    name: "Arkan Reviewer",
    role: "Insurance analyst",
    password: null,
  },
];

/** Passwords created/reset at runtime — module memory, demo only. */
const createdPasswords = new Map<string, string>();

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function findAccount(email: string): DemoAccount | undefined {
  const norm = normalizeEmail(email);
  return ACCOUNTS.find((a) => a.email === norm);
}

/** True when the account exists and still has no password (→ setup 2FA flow). */
export function accountNeedsSetup(email: string): boolean {
  const account = findAccount(email);
  return account != null && account.password == null && !createdPasswords.has(normalizeEmail(email));
}

/** Stores a created/reset password (kept in module memory, demo). */
export function setDemoPassword(email: string, password: string): void {
  createdPasswords.set(normalizeEmail(email), password);
}

/** Identity of a demo account (name + role), or null when the e-mail is unknown. */
export function getDemoUser(email: string): DemoUser | null {
  const account = findAccount(email);
  if (account == null) return null;
  return { email: account.email, name: account.name, role: account.role };
}

/**
 * Decodes the e-mail out of a `cs_session` value — format `base64url(email).signature`
 * (see lib/auth-session.ts). Kept free of node:crypto so the module stays edge-safe:
 * middleware.ts imports it. Only accounts of ACCOUNTS resolve to a user, so a tampered
 * payload yields null.
 */
export function decodeSessionEmail(sessionValue: string | null | undefined): string | null {
  if (!sessionValue) return null;
  const payload = sessionValue.split(".")[0];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Demo user behind a `cs_session` cookie value, or null when absent/unknown. */
export function getSessionUser(sessionValue: string | null | undefined): DemoUser | null {
  const email = decodeSessionEmail(sessionValue);
  return email == null ? null : getDemoUser(email);
}

export function verifyDemoPassword(email: string, password: string): boolean {
  if (password.length === 0) return false;
  const norm = normalizeEmail(email);
  const created = createdPasswords.get(norm);
  if (created != null) return created === password;
  const account = findAccount(email);
  return account != null && account.password != null && account.password === password;
}
