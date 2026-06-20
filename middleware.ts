import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  ADMIN_PATH,
  AUTH_PATHS,
  getDashboardPath,
  MEMBER_PATH,
  type UserRole,
} from "@/lib/auth/types";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

    if (token && isAuthPath(pathname)) {
      const role = token.role as UserRole;
      const destination = role ? getDashboardPath(role) : MEMBER_PATH;
      return NextResponse.redirect(new URL(destination, request.url));
    }

    if (!token && isProtectedPath(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token && isAdminPath(pathname)) {
      const role = token.role as UserRole;

      if (role !== "admin") {
        return NextResponse.redirect(new URL(MEMBER_PATH, request.url));
      }
    }

    if (token && isMemberPath(pathname)) {
      const role = token.role as UserRole;

      if (role === "admin") {
        return NextResponse.redirect(new URL(ADMIN_PATH, request.url));
      }
    }

    return NextResponse.next();
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
