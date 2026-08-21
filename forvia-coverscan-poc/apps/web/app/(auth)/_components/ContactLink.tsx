/** Centered "Contact Forvia" footer link of every login screen. */
export function ContactLink() {
  return (
    <a
      href="mailto:contact@forvia.example"
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
      Contact Forvia
    </a>
  );
}
