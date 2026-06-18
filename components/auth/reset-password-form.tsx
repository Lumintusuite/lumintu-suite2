"use client";

import { useActionState } from "react";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";

const initialState: AuthActionState = {};

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPassword, initialState);

  return (
    <AuthCard
      title="Set new password"
      description="Choose a strong password for your account."
      footer={
        <p className="text-sm text-muted-foreground">
          <AuthLink href="/login">Back to sign in</AuthLink>
        </p>
      }
    >
      <form action={formAction} className="space-y-4">
        <FormMessage error={state.error} success={state.success} />

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <SubmitButton pendingLabel="Updating password...">
          Update password
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
