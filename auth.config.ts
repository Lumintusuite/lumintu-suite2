import type { NextRequest } from "next/server";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    authorized({ auth, request }: { auth: any; request: NextRequest }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith("/member") || request.nextUrl.pathname.startsWith("/admin");
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
        return Response.redirect(new URL("/member", request.nextUrl));
      }
      return true;
    },
  },
  providers: [],
};
