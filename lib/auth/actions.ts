"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getDashboardPath } from "@/lib/auth/types";
import type { AuthActionState } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/emails/actions";

function getFormString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const userId = data.user?.id;

  if (!userId) {
    return { error: "Unable to sign in. Please try again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile?.role) {
    return { error: "Unable to load your profile. Please contact support." };
  }

  revalidatePath("/", "layout");
  redirect(getDashboardPath(profile.role));
}

export async function register(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const startTime = Date.now();
  console.log("[REGISTER] Starting registration process", { startTime });

  const fullName = getFormString(formData, "fullName");
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");
  const confirmPassword = getFormString(formData, "confirmPassword");

  console.log("[REGISTER] Form data received", { email, fullName });

  if (!fullName || !email || !password) {
    console.log("[REGISTER] Validation failed: Missing fields");
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    console.log("[REGISTER] Validation failed: Password too short");
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    console.log("[REGISTER] Validation failed: Passwords do not match");
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const origin = getSiteOrigin();

  console.log("[REGISTER] Calling supabase.auth.signUp", { email, origin });
  const signUpStart = Date.now();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  const signUpDuration = Date.now() - signUpStart;
  console.log("[REGISTER] signUp completed", { 
    duration: signUpDuration, 
    hasError: !!error, 
    hasSession: !!data.session,
    hasUser: !!data.user 
  });

  if (error) {
    console.error("[REGISTER] signUp error", error);
    return { error: error.message };
  }

  if (data.session) {
    console.log("[REGISTER] Email confirmation disabled, session created immediately");
    
    // Verify profile was created by trigger
    if (data.user) {
      console.log("[REGISTER] Verifying profile creation for user", { userId: data.user.id });
      const profileCheckStart = Date.now();
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", data.user.id)
        .maybeSingle();

      const profileCheckDuration = Date.now() - profileCheckStart;
      console.log("[REGISTER] Profile check completed", { 
        duration: profileCheckDuration, 
        hasProfile: !!profile, 
        hasError: !!profileError 
      });

      if (profileError) {
        console.error("[REGISTER] Profile check error", profileError);
      }

      if (!profile) {
        console.error("[REGISTER] Profile not found after signup - trigger may have failed");
        // Continue anyway as user is created, but log the issue
      }

      // Send welcome email (non-blocking)
      console.log("[REGISTER] Sending welcome email");
      const emailStart = Date.now();
      try {
        await sendWelcomeEmail(data.user.id, email, fullName);
        const emailDuration = Date.now() - emailStart;
        console.log("[REGISTER] Welcome email sent", { duration: emailDuration });
      } catch (emailError) {
        console.error("[REGISTER] Welcome email failed", emailError);
        // Don't fail registration if email fails
      }
    }
    
    revalidatePath("/", "layout");
    const totalDuration = Date.now() - startTime;
    console.log("[REGISTER] Redirecting to /member", { totalDuration });
    redirect("/member");
  }

  const totalDuration = Date.now() - startTime;
  console.log("[REGISTER] Email confirmation required", { totalDuration });

  return {
    success:
      "Account created. Check your email to confirm your address, then sign in.",
  };
}

export async function forgotPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = getFormString(formData, "email");

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();
  const origin = getSiteOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function resetPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = getFormString(formData, "password");
  const confirmPassword = getFormString(formData, "confirmPassword");

  if (!password) {
    return { error: "Password is required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login?reset=success");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
