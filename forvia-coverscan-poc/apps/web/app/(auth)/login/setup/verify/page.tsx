"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DEMO_2FA_CODE } from "@/lib/auth-demo";
import { AuthButton } from "../../../_components/AuthButton";
import { AuthTitle, AuthSubtitle } from "../../../_components/AuthHeading";
import { ContactLink } from "../../../_components/ContactLink";
import { PinInput } from "../../../_components/PinInput";
import { ResendButton } from "../../../_components/ResendButton";
import { getAuthEmail } from "../../../_components/auth-client";

/** /login/setup/verify — mockups 5 & 7: first-login 2FA before password creation. */
export default function SetupVerifyPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("nouveau@forvia.com");

  React.useEffect(() => {
    setEmail(getAuthEmail("nouveau@forvia.com"));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === DEMO_2FA_CODE) {
      router.push("/login/setup/password");
    } else {
      setError("Code incorrect.");
    }
  };

  return (
    <div>
      <AuthTitle>Créer votre mot de passe</AuthTitle>
      <AuthSubtitle>
        Pour accéder à CoverScan, confirmez votre identité avec un code pin à 6 chiffres envoyé à{" "}
        <strong style={{ fontWeight: 700, color: "var(--foreground)" }}>{email}</strong> pour créer
        votre mot de passe.
      </AuthSubtitle>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginTop: 40 }}>
          <PinInput
            value={code}
            onChange={(v) => {
              setCode(v);
              setError(null);
            }}
          />
        </div>
        {error != null && (
          <p role="alert" style={{ margin: "10px 0 0", fontSize: 13, color: "var(--status-red)" }}>
            {error}
          </p>
        )}
        <div style={{ marginTop: 16 }}>
          <ResendButton />
        </div>
        <div style={{ marginTop: 40, display: "grid", gap: 12 }}>
          <AuthButton type="submit">Continuer</AuthButton>
          <AuthButton type="button" variant="grey" onClick={() => router.push("/login")}>
            Annuler
          </AuthButton>
        </div>
      </form>
      <div style={{ marginTop: 24 }}>
        <ContactLink />
      </div>
    </div>
  );
}
