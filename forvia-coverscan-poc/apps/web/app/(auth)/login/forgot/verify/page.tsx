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
      setError("Incorrect code.");
    }
  };

  return (
    <div>
      <AuthTitle>Forgot password</AuthTitle>
      <AuthSubtitle>
        To reset your password, enter the 6-digit code sent to your inbox.
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
          <AuthButton type="submit">Continue</AuthButton>
          <AuthButton type="button" variant="grey" onClick={() => router.push("/login")}>
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
