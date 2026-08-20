import { notFound } from "next/navigation";
import { getCertificate, getCertificates } from "@/lib/repository";
import { CertificateView } from "./certificate-view";

export function generateStaticParams() {
  return getCertificates().map((c) => ({ id: c.id }));
}

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cert = getCertificate(id);
  if (!cert) notFound();
  const ids = getCertificates().map((c) => c.id).sort();
  const i = ids.indexOf(id);
  return <CertificateView cert={cert} prevId={ids[i - 1]} nextId={ids[i + 1]} />;
}
