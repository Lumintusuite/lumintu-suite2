"use server";

import { redirect } from "next/navigation";

// This file is deprecated. Use lib/auth/auth-actions.ts instead.
// Kept for backward compatibility during migration.

export async function login(
  _prevState: any,
  formData: FormData
): Promise<any> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // Redirect to NextAuth sign-in
  redirect(`/api/auth/signin?email=${encodeURIComponent(email)}`);
}

export async function register(
  _prevState: any,
  formData: FormData
): Promise<any> {
  // Redirect to the new registration action
  // This will be handled by the register form using the new action
  redirect("/register");
}

export async function forgotPassword(
  _prevState: any,
  formData: FormData
): Promise<any> {
  // Password reset not implemented in Phase 3
  return { error: "Password reset not yet implemented." };
}

export async function resetPassword(
  _prevState: any,
  formData: FormData
): Promise<any> {
  // Password reset not implemented in Phase 3
  return { error: "Password reset not yet implemented." };
}

export async function signOut(): Promise<void> {
  redirect("/api/auth/signout");
}
