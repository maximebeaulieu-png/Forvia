"use client";

import { useRouter } from "next/navigation";
import { AuthTitle } from "../../../_components/AuthHeading";
import { ContactLink } from "../../../_components/ContactLink";
import { NewPasswordForm } from "../../../_components/NewPasswordForm";
import { getAuthEmail } from "../../../_components/auth-client";

/** /login/setup/password — mockup 6: "Create your password", enter + confirm. */
export default function SetupPasswordPage() {
  const router = useRouter();

  const handleSubmit = async (password: string) => {
    const email = getAuthEmail("nouveau@forvia.com");
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
      <AuthTitle>Create your password</AuthTitle>
      <div style={{ marginTop: 44 }}>
        <NewPasswordForm submitLabel="Save" onSubmitPassword={handleSubmit} />
      </div>
      <div style={{ marginTop: 24 }}>
        <ContactLink />
      </div>
    </div>
  );
}
