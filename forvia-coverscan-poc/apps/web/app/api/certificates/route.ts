import { NextResponse } from "next/server";
import { getCertificates } from "@/lib/repository";

export function GET() {
  const list = getCertificates().map((c) => ({
    id: c.id,
    supplier: c.supplier,
    country: c.country,
    insurer: c.insurer,
    decision: c.decision,
    score: c.score,
    needsReview: c.needsReview,
    expiry: c.expiry,
  }));
  return NextResponse.json(list);
}
