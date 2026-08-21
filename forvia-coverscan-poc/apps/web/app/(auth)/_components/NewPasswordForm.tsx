"use client";

import * as React from "react";
import { isValidPassword, PASSWORD_RULE_TEXT } from "@/lib/auth-demo";
import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";

interface NewPasswordFormProps {
  submitLabel: string;
  onSubmitPassword: (password: string) => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Shared "Mot de passe / Confirmer le mot de passe" form of the create & reset
 * screens — rule helper under the field, submit disabled until the password is
 * valid and confirmed, helper turns red on an invalid attempt.
 */
export function NewPasswordForm({ submitLabel, onSubmitPassword, onCancel }: NewPasswordFormProps) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [attempted, setAttempted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const valid = isValidPassword(password);
  const canSubmit = valid && confirm === password && !busy;
  const showRuleError = attempted && !valid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || confirm !== password) {
      setAttempted(true);
      return;
    }
    setBusy(true);
    try {
      await onSubmitPassword(password);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <AuthInput
          label="Mot de passe"
          password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => {
            if (password.length > 0 && !valid) setAttempted(true);
          }}
          autoComplete="new-password"
        />
        <p
          role={showRuleError ? "alert" : undefined}
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            lineHeight: 1.4,
            color: showRuleError ? "var(--status-red)" : "var(--muted-foreground)",
          }}
        >
          {PASSWORD_RULE_TEXT}
        </p>
      </div>
      <div style={{ marginTop: 28 }}>
        <AuthInput
          label="Confirmer le mot de passe"
          password
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div style={{ marginTop: 40, display: "grid", gap: 12 }}>
        <AuthButton type="submit" disabled={!canSubmit}>
          {submitLabel}
        </AuthButton>
        {onCancel != null && (
          <AuthButton type="button" variant="grey" onClick={onCancel}>
            Annuler
          </AuthButton>
        )}
      </div>
    </form>
  );
}
