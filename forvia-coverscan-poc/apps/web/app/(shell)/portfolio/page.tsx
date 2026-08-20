import { PageHeading } from "@/components/shell/PageHeading";
import { getAggregates, getCertificates } from "@/lib/repository";
import { PortfolioView } from "./portfolio-view";

/**
 * Screen 2 (brief priority) — Portfolio: exposure at a glance.
 * Server component: reads the cached aggregates and hands the slices to the
 * client view. Amounts in aggregates.json are EUR major units; the view
 * converts to minor units at the GapBar boundary.
 */
export default function PortfolioPage() {
  const aggregates = getAggregates();
  const certificateIds = getCertificates().map((c) => c.id);

  return (
    <>
      <PageHeading
        title="Portfolio"
        sub="150 certificates analysed · demo dataset: 10 real + 140 synthetic · reference date 15 Apr 2025"
      />
      <PortfolioView
        portfolio={aggregates.portfolio}
        byCountry={aggregates.byCountry}
        gapByGuarantee={aggregates.gapByGuarantee}
        expiring={aggregates.expiring}
        topRisks={aggregates.topRisks}
        certificateIds={certificateIds}
      />
    </>
  );
}
