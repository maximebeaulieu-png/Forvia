import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/PageHeading";
import { getCertificate } from "@/lib/repository";
import { SupplierView } from "./suppliers-view";

export const metadata: Metadata = { title: "Suppliers — CoverScan" };

/** Supplier 360 (mid-fi): Metraton S.r.l. — all certificates, change detection, policy numbers. */
export default function SuppliersPage() {
  const cert = getCertificate("10");
  return (
    <>
      <PageHeading
        title="Metraton S.r.l."
        sub="Supplier 360 · all certificates, change detection, policy numbers"
      />
      <SupplierView
        certificateId={cert?.id ?? "10"}
        supplier={cert?.supplier ?? "Metraton S.r.l."}
        insurer={cert?.insurer ?? "Generali Italia"}
        rating={cert?.rating ?? "A · S&P"}
        expiry={cert?.expiry ?? "12 Jul 2025"}
        decision={cert?.decision ?? "FORMAL_DEFECT"}
      />
    </>
  );
}
