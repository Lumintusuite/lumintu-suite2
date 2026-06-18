"use client";

import { useActionState } from "react";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction] = useActionState(register, initialState);

  return (
    <AuthCard
      title="Create account"
      description="Register as a member to access Lumintu Suite."
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <AuthLink href="/login">Sign in</AuthLink>
        </p>
      }
    >
      <form action={formAction} className="space-y-4">
        <FormMessage error={state.error} success={state.success} />

        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            required
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <SubmitButton pendingLabel="Creating account...">
          Create account
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
