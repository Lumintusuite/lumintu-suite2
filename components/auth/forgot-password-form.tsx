"use client";

import { useActionState } from "react";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";

const initialState: AuthActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, initialState);

  return (
    <AuthCard
      title="Reset password"
      description="Enter your email and we will send you a reset link."
      footer={
        <p className="text-sm text-muted-foreground">
          Remember your password? <AuthLink href="/login">Sign in</AuthLink>
        </p>
      }
    >
      <form action={formAction} className="space-y-4">
        <FormMessage error={state.error} success={state.success} />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <SubmitButton pendingLabel="Sending link...">Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}
