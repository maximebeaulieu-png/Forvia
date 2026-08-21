import type { Metadata } from "next";
import { getCertificates } from "@/lib/repository";
import {
  CertificatesView,
  type CertificateRow,
  type ViewSlug,
} from "./certificates-view";

export const metadata: Metadata = {
  title: "Certificates — CoverScan",
};

const VIEW_SLUGS: ViewSlug[] = [
  "all",
  "needs-review",
  "not-admissible",
  "expiring",
  "my-suppliers",
];

/** Accepts both the slug ("needs-review") and the pill label ("Needs review"). */
function normalizeView(raw: string | string[] | undefined): ViewSlug {
  const value = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const slug = value.trim().toLowerCase().replace(/\s+/g, "-") as ViewSlug;
  return VIEW_SLUGS.includes(slug) ? slug : "all";
}

function normalizeQ(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  return (
    <CertificatesView
      certificates={getCertificates() as CertificateRow[]}
      view={normalizeView(params.view)}
      q={normalizeQ(params.q)}
      entity={normalizeQ(params.filter)}
    />
  );
}
