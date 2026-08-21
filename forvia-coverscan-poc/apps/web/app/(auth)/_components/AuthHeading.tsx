/** Login-screen title (34–38px semibold navy) and muted subtitle. */
export function AuthTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontSize: 36,
        lineHeight: 1.2,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        color: "var(--foreground)",
        margin: 0,
      }}
    >
      {children}
    </h1>
  );
}

export function AuthSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "20px 0 0",
        // Mockup intro copy runs slightly wider than the 448px form column.
        width: 532,
        maxWidth: "calc(100vw - 48px)",
        fontSize: 16,
        lineHeight: 1.5,
        color: "var(--muted-foreground)",
      }}
    >
      {children}
    </p>
  );
}
