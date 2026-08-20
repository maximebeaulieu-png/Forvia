import { NextResponse } from "next/server";
import { getCertificate } from "@/lib/repository";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cert = getCertificate(id);
  if (!cert) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(cert);
}
