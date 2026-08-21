import { NextResponse } from "next/server";
import { accountNeedsSetup } from "@/lib/auth-demo";

/**
 * POST /api/auth/start {email} → which flow the email step should route to:
 * "setup" (account without password → 2FA + password creation) or "password".
 */
export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  return NextResponse.json({ mode: accountNeedsSetup(email) ? "setup" : "password" });
}
