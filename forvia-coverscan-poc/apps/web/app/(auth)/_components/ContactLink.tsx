/** Centered "Contacter CoverScan" footer link of every login screen. */
export function ContactLink() {
  return (
    <a
      href="mailto:contact@coverscan.example"
      style={{
        display: "block",
        textAlign: "center",
        fontSize: 14,
        fontWeight: 600,
        color: "var(--foreground)",
        border: "none",
        textDecoration: "none",
      }}
    >
      Contacter CoverScan
    </a>
  );
}
