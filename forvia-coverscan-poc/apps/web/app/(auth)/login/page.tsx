"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthButton } from "../_components/AuthButton";
import { AuthInput } from "../_components/AuthInput";
import { AuthTitle, AuthSubtitle } from "../_components/AuthHeading";
import { ContactLink } from "../_components/ContactLink";
import { rememberAuthEmail } from "../_components/auth-client";

/**
 * /login — mockups 1 & 2: the email step, then the password step on the same
 * route (validated email shown in the rounded white card).
 */
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<"email" | "password">("email");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().length === 0 || busy) return;
    setBusy(true);
    rememberAuthEmail(email.trim());
    let mode = "password";
    try {
      const res = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        const data = (await res.json()) as { mode?: string };
        if (data.mode === "setup") mode = "setup";
      }
    } catch {
      /* demo: fall through to the password step */
    }
    setBusy(false);
    if (mode === "setup") {
      router.push("/login/setup/verify");
    } else {
      setStep("password");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (res.ok) {
        router.push("/");
        return;
      }
      setError("Incorrect email or password.");
    } catch {
      setError("Incorrect email or password.");
    } finally {
      setBusy(false);
    }
  };

  if (step === "email") {
    return (
      <div>
        <AuthTitle>Welcome to Forvia</AuthTitle>
        <AuthSubtitle>Set up your password to access the platform</AuthSubtitle>
        <form onSubmit={handleEmailSubmit} noValidate style={{ marginTop: 40 }}>
          <AuthInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
          <div style={{ marginTop: 20 }}>
            <AuthButton type="submit" disabled={busy}>
              Sign in
            </AuthButton>
          </div>
        </form>
        <div style={{ marginTop: 24 }}>
          <ContactLink />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuthTitle>Welcome to Forvia</AuthTitle>
      <div
        style={{
          marginTop: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 54,
          borderRadius: 14,
          border: "1px solid var(--border)",
          background: "var(--card)",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--foreground)",
        }}
      >
        {email.trim()}
      </div>
      <form onSubmit={handlePasswordSubmit} noValidate style={{ marginTop: 30 }}>
        <AuthInput
          label="Password"
          password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
        />
        {error != null && (
          <p role="alert" style={{ margin: "8px 0 0", fontSize: 13, color: "var(--status-red)" }}>
            {error}
          </p>
        )}
        <div style={{ marginTop: 12 }}>
          <Link
            href="/login/forgot"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--foreground)",
              border: "none",
              textDecoration: "none",
            }}
          >
            Forgot password?
          </Link>
        </div>
        <div style={{ marginTop: 40, display: "grid", gap: 12 }}>
          <AuthButton type="submit" disabled={busy}>
            Sign in
          </AuthButton>
          <AuthButton
            type="button"
            variant="grey"
            onClick={() => {
              setStep("email");
              setPassword("");
              setError(null);
            }}
          >
            Cancel
          </AuthButton>
        </div>
      </form>
      <div style={{ marginTop: 24 }}>
        <ContactLink />
      </div>
    </div>
  );
}
