"use client";

/** Client-side memory of the email entered on the /login step (demo flow glue). */
const KEY = "cs-auth-email";

export function rememberAuthEmail(email: string): void {
  try {
    sessionStorage.setItem(KEY, email);
  } catch {
    /* storage unavailable — demo fallback below */
  }
}

export function getAuthEmail(fallback: string): string {
  try {
    return sessionStorage.getItem(KEY) || fallback;
  } catch {
    return fallback;
  }
}
