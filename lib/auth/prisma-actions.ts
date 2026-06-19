"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Simple password hashing (temporary - should use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  // For now, just return the password as-is
  // TODO: Implement proper password hashing with bcrypt
  return password;
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // For now, just compare directly
  // TODO: Implement proper password verification with bcrypt
  return password === hashedPassword;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/member" });
  } catch (error) {
    return { error: "Invalid email or password." };
  }
}

export async function register(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email already registered." };
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: fullName,
        profile: {
          create: {
            fullName,
            role: "member",
          },
        },
      },
    });

    await signIn("credentials", { email, password, redirectTo: "/member" });
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function updateProfile(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const userId = formData.get("userId") as string;

  if (!fullName || !userId) {
    return { error: "Full name and user ID are required." };
  }

  try {
    await prisma.profile.update({
      where: { userId },
      data: { fullName },
    });

    revalidatePath("/member/account");
    return { success: "Profile updated successfully." };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile. Please try again." };
  }
}
