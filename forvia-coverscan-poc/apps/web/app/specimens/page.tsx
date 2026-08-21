import { VerdictSection } from "./sections/verdict";
import { CoverageSection } from "./sections/coverage";
import { DocumentSection } from "./sections/document";

export const metadata = { title: "Forvia — Component specimens" };

export default function SpecimensPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-8 py-10 space-y-12">
      <header className="space-y-1">
        <h1>Component specimens</h1>
        <p className="text-muted-foreground">
          Re-implemented Forvia components, side by side with the design-system reference cards
          (design-pack / Design System Cover Scan).
        </p>
      </header>
      <VerdictSection />
      <CoverageSection />
      <DocumentSection />
    </main>
  );
}
