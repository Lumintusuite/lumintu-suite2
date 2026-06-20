import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import type { AuthUser, UserRole } from "@/lib/auth/types";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    profile: user.profile
      ? {
          id: user.profile.id,
          fullName: user.profile.fullName,
          createdAt: user.profile.createdAt.toISOString(),
          updatedAt: user.profile.updatedAt.toISOString(),
        }
      : null,
  };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role as UserRole | null;
}

export async function requireAuthenticated(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  return { user };
}

export async function requireAdmin(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  if (user.role !== "admin") {
    return { error: "Admin access required." };
  }

  return { user };
}

export async function requireMember(): Promise<
  { user: AuthUser } | { error: string }
> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  if (user.role !== "member" && user.role !== "admin") {
    return { error: "Member access required." };
  }

  return { user };
}
