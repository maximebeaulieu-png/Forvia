"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DEMO_2FA_CODE } from "@/lib/auth-demo";
import { AuthButton } from "../../../_components/AuthButton";
import { AuthTitle, AuthSubtitle } from "../../../_components/AuthHeading";
import { ContactLink } from "../../../_components/ContactLink";
import { PinInput } from "../../../_components/PinInput";
import { ResendButton } from "../../../_components/ResendButton";

/** /login/forgot/verify — mockup 4: forgot-password 2FA code entry. */
export default function ForgotVerifyPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === DEMO_2FA_CODE) {
      router.push("/login/reset");
    } else {
      setError("Code incorrect.");
    }
  };

  return (
    <div>
      <AuthTitle>Mot de passe oublié</AuthTitle>
      <AuthSubtitle>
        Afin de réinitialiser votre mot de passe, vous devez entrer un code pin à 6 chiffres envoyé
        dans votre boite mail.
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
