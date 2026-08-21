"use client";

import { useRouter } from "next/navigation";
import { AuthButton } from "../../_components/AuthButton";
import { AuthTitle, AuthSubtitle } from "../../_components/AuthHeading";
import { ContactLink } from "../../_components/ContactLink";

/** /login/forgot — mockup 3: "Mot de passe oublié". */
export default function ForgotPage() {
  const router = useRouter();
  return (
    <div>
      <AuthTitle>Mot de passe oublié</AuthTitle>
      <AuthSubtitle>
        Afin de réinitialiser votre mot de passe, vous devez entrer un code pin à 6 chiffres envoyé
        dans votre boite mail.
      </AuthSubtitle>
      <div style={{ marginTop: 36, display: "grid", gap: 12 }}>
        <AuthButton onClick={() => router.push("/login/forgot/verify")}>
          Envoyer le code mail e-mail
        </AuthButton>
        <AuthButton variant="grey" onClick={() => router.push("/login")}>
          Annuler
        </AuthButton>
      </div>
      <div style={{ marginTop: 20 }}>
        <ContactLink />
      </div>
    </div>
  );
}
