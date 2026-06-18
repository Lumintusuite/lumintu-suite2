import { createClient } from "@/lib/supabase/server";
import type { AuthUser, Profile, UserRole } from "@/lib/auth/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    profile,
  };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const profile = await getProfile(userId);
  return profile?.role ?? null;
}
