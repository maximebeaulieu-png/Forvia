/**
 * Login flow layout — full-screen split without the app shell.
 * Left ~58%: token background, form block anchored ~14vh from the top (per the mockups)
 * (FORVIA wordmark, then the screen).
 * Right ~42%: full-height visual (object-fit cover).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
      <div
        style={{
          flex: "1 1 58%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "max(72px, 14vh) 24px 48px",
        }}
      >
        <div style={{ width: "min(448px, 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <img src="/logo-wordmark.png" alt="FORVIA" style={{ height: 22, display: "block" }} />
          </div>
          {children}
        </div>
      </div>
      <div style={{ flex: "0 0 42%", position: "relative", minHeight: "100vh" }}>
        <img
          src="/login-visual.svg"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
