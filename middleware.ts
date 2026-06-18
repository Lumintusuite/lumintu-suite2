import { type NextRequest, NextResponse } from "next/server";

import {
  ADMIN_PATH,
  AUTH_PATHS,
  getDashboardPath,
  MEMBER_PATH,
  type UserRole,
} from "@/lib/auth/types";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_PATH_SET = new Set<string>(AUTH_PATHS);

function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_SET.has(pathname);
}

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`);
}

function isMemberPath(pathname: string): boolean {
  return pathname === MEMBER_PATH || pathname.startsWith(`${MEMBER_PATH}/`);
}

function isProtectedPath(pathname: string): boolean {
  return isAdminPath(pathname) || isMemberPath(pathname);
}

async function getRoleFromSupabase(
  supabase: Awaited<ReturnType<typeof updateSession>>["supabase"],
  userId: string
): Promise<UserRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return (data?.role as UserRole | undefined) ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const { supabase, supabaseResponse, user } = await updateSession(request);

    if (user && isAuthPath(pathname)) {
      const role = await getRoleFromSupabase(supabase, user.id);
      const destination = role ? getDashboardPath(role) : MEMBER_PATH;
      return NextResponse.redirect(new URL(destination, request.url));
    }

    if (!user && isProtectedPath(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isAdminPath(pathname)) {
      const role = await getRoleFromSupabase(supabase, user.id);

      if (role !== "admin") {
        return NextResponse.redirect(new URL(MEMBER_PATH, request.url));
      }
    }

    if (user && isMemberPath(pathname)) {
      const role = await getRoleFromSupabase(supabase, user.id);

      if (role === "admin") {
        return NextResponse.redirect(new URL(ADMIN_PATH, request.url));
      }
    }

    return supabaseResponse;
  } catch {
    if (isProtectedPath(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
