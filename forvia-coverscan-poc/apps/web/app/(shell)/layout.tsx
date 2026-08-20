import { Sidebar } from "@/components/shell/Sidebar";
import { TopHeader } from "@/components/shell/TopHeader";
import { getAggregates } from "@/lib/repository";

/** App shell — sidebar + header column, scrollable main (ui_kit App structure). */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const { profiles } = getAggregates();
  return (
    <div style={{ display: "flex", height: "100vh", minHeight: 0, background: "var(--background)" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopHeader profiles={profiles} />
        <main style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
