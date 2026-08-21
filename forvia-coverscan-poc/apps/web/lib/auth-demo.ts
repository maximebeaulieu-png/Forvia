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
  "Au moins 10 caractères, une minuscule, une majuscule, un chiffre, un caractère spécial";

/** Password policy for screens "Créer votre mot de passe" / "Réinitialiser le mot de passe". */
export function isValidPassword(password: string): boolean {
  return (
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

interface DemoAccount {
  email: string;
  /** null = account exists but must create a password (first-login flow). */
  password: string | null;
}

const ACCOUNTS: DemoAccount[] = [
  { email: "demo@forvia.com", password: "CoverScan2026!" },
  { email: "nouveau@forvia.com", password: null },
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

export function verifyDemoPassword(email: string, password: string): boolean {
  if (password.length === 0) return false;
  const norm = normalizeEmail(email);
  const created = createdPasswords.get(norm);
  if (created != null) return created === password;
  const account = findAccount(email);
  return account != null && account.password != null && account.password === password;
}
