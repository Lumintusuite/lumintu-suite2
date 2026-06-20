"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/emails/actions";
import { getDashboardPath, type UserRole } from "@/lib/auth/types";

function getFormString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function register(
  _prevState: { error?: string; success?: string },
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const fullName = getFormString(formData, "fullName");
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");
  const confirmPassword = getFormString(formData, "confirmPassword");

  if (!fullName || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user with profile
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: fullName,
      role: "member",
      profile: {
        create: {
          fullName,
        },
      },
    },
  });

  // Send welcome email (non-blocking)
  try {
    await sendWelcomeEmail(user.id, email, fullName);
  } catch (emailError) {
    console.error("Welcome email failed", emailError);
    // Don't fail registration if email fails
  }

  revalidatePath("/", "layout");
  redirect("/member");
}

export async function login(
  _prevState: { error?: string; success?: string },
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const email = getFormString(formData, "email");
  const password = getFormString(formData, "password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // This will be handled by NextAuth credentials provider
  // We just need to redirect to the NextAuth API
  redirect(`/api/auth/signin?email=${encodeURIComponent(email)}`);
}

export async function signOut(): Promise<void> {
  redirect("/api/auth/signout");
}
