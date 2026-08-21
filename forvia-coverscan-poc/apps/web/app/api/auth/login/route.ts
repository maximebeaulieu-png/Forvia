import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, verifyDemoPassword } from "@/lib/auth-demo";
import { createSessionValue } from "@/lib/auth-session";

/** POST /api/auth/login {email, password} → 200 + httpOnly cs_session cookie, or 401. */
export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyDemoPassword(email, password)) {
    return NextResponse.json({ error: "E-mail ou mot de passe incorrect." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionValue(email), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
