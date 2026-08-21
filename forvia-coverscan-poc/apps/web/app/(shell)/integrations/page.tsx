import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/PageHeading";
import { IntegrationsView } from "./integrations-view";

export const metadata: Metadata = { title: "Integrations — Forvia" };

/** Integrations & exports (mid-fi): SAP Ariba, Excel, registry and rates. */
export default function IntegrationsPage() {
  return (
    <>
      <PageHeading title="Integrations & exports" sub="SAP Ariba, Excel, registry and rates" />
      <IntegrationsView />
    </>
  );
}
