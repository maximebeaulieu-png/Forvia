import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionUser } from "@/lib/auth-demo";

/** GET /api/auth/me → {email, name, role} of the signed-in demo account, or 401. */
export async function GET() {
  const user = getSessionUser((await cookies()).get(SESSION_COOKIE)?.value);
  if (user == null) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json(user);
}
