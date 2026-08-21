import { cookies } from "next/headers";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopHeader } from "@/components/shell/TopHeader";
import { SESSION_COOKIE, getSessionUser } from "@/lib/auth-demo";

/** App shell — sidebar + header column, scrollable main (ui_kit App structure). */
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  /* Same helper as GET /api/auth/me — resolved here, no internal HTTP round-trip. */
  const user = getSessionUser((await cookies()).get(SESSION_COOKIE)?.value);
  return (
    <div style={{ display: "flex", height: "100vh", minHeight: 0, background: "var(--background)" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopHeader user={user} />
        <main style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
