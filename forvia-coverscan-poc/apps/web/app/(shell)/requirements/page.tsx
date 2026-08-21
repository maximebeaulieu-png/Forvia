import type { Metadata } from "next";
import { PageHeading } from "@/components/shell/PageHeading";
import { getAggregates } from "@/lib/repository";
import { RequirementsView, type ProfileItem } from "./requirements-view";

export const metadata: Metadata = { title: "Requirements — Forvia" };

/** Requirements profiles (mid-fi): thresholds, gates and weights per profile. */
export default function RequirementsPage() {
  const { profiles } = getAggregates();
  return (
    <>
      <PageHeading
        title="Requirements profiles"
        sub="Thresholds, gates and weights. Each analysis records the profile version used."
      />
      <RequirementsView profiles={profiles as ProfileItem[]} />
    </>
  );
}
