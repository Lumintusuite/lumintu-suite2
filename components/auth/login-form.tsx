"use client";

import { useActionState } from "react";

import { AuthCard, AuthLink } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth/actions";
import type { AuthActionState } from "@/lib/auth/types";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <AuthCard
      title="Sign in"
      description="Enter your credentials to access your dashboard."
      footer={
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <AuthLink href="/register">Create one</AuthLink>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <AuthLink href="/forgot-password">Forgot password?</AuthLink>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <SubmitButton pendingLabel="Signing in...">Sign in</SubmitButton>
      </form>
    </AuthCard>
  );
}
