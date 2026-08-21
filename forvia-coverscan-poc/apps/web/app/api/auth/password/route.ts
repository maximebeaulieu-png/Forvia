import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, isValidPassword, setDemoPassword } from "@/lib/auth-demo";
import { createSessionValue } from "@/lib/auth-session";

/** POST /api/auth/password {email, password} → stores the created/reset password (demo memory). */
export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (email.length === 0 || !isValidPassword(password)) {
    return NextResponse.json({ error: "Mot de passe non conforme." }, { status: 422 });
  }
  setDemoPassword(email, password);
  // A freshly created/reset password logs the user straight in (no second sign-in step).
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionValue(email), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
