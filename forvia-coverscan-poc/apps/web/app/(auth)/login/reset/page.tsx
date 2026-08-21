"use client";

import { useRouter } from "next/navigation";
import { AuthTitle, AuthSubtitle } from "../../_components/AuthHeading";
import { ContactLink } from "../../_components/ContactLink";
import { NewPasswordForm } from "../../_components/NewPasswordForm";
import { getAuthEmail } from "../../_components/auth-client";

/** /login/reset — mockup 8: "Réinitialiser le mot de passe". */
export default function ResetPage() {
  const router = useRouter();

  const handleSubmit = async (password: string) => {
    const email = getAuthEmail("demo@forvia.com");
    try {
      await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/");
        return;
      }
    } catch {
      /* demo */
    }
    router.push("/login");
  };

  return (
    <div>
      <AuthTitle>Réinitialiser le mot de passe</AuthTitle>
      <AuthSubtitle>Créez votre nouveau mot de passe</AuthSubtitle>
      <div style={{ marginTop: 36 }}>
        <NewPasswordForm
          submitLabel="Réinitialiser le mot de passe"
          onSubmitPassword={handleSubmit}
          onCancel={() => router.push("/login")}
        />
      </div>
      <div style={{ marginTop: 20 }}>
        <ContactLink />
      </div>
    </div>
  );
}
