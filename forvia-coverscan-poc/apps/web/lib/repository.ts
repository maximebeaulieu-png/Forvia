import type { CachedCertificateT } from "@coverscan/schemas";
import raw from "@/data/certificates.json";

/**
 * JSON-backed certificate repository (no DB this phase). The dataset is
 * generated and zod-validated by scripts/build-cached-data.mjs, so the cast
 * from the JSON literal type is safe.
 */
const certificates = raw as unknown as CachedCertificateT[];

export function getCertificates(): CachedCertificateT[] {
  return certificates;
}

export function getCertificate(id: string): CachedCertificateT | undefined {
  return certificates.find((c) => c.id === id);
}
