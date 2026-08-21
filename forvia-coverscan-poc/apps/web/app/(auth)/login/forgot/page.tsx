"use client";

import { useRouter } from "next/navigation";
import { AuthButton } from "../../_components/AuthButton";
import { AuthTitle, AuthSubtitle } from "../../_components/AuthHeading";
import { ContactLink } from "../../_components/ContactLink";

/** /login/forgot — mockup 3: "Forgot password". */
export default function ForgotPage() {
  const router = useRouter();
  return (
    <div>
      <AuthTitle>Forgot password</AuthTitle>
      <AuthSubtitle>
        To reset your password, enter the 6-digit code sent to your inbox.
      </AuthSubtitle>
      <div style={{ marginTop: 36, display: "grid", gap: 12 }}>
        <AuthButton onClick={() => router.push("/login/forgot/verify")}>
          Send the code by email
        </AuthButton>
        <AuthButton variant="grey" onClick={() => router.push("/login")}>
          Cancel
        </AuthButton>
      </div>
      <div style={{ marginTop: 20 }}>
        <ContactLink />
      </div>
    </div>
  );
}
