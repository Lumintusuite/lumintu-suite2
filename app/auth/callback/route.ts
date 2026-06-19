import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const startTime = Date.now();
  console.log("[AUTH CALLBACK] Starting auth callback", { startTime });

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/member";

  console.log("[AUTH CALLBACK] Request received", { 
    hasCode: !!code, 
    next, 
    origin 
  });

  if (code) {
    console.log("[AUTH CALLBACK] Exchanging code for session");
    const exchangeStart = Date.now();
    
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    const exchangeDuration = Date.now() - exchangeStart;
    console.log("[AUTH CALLBACK] Code exchange completed", { 
      duration: exchangeDuration, 
      hasError: !!error 
    });

    if (!error) {
      const totalDuration = Date.now() - startTime;
      console.log("[AUTH CALLBACK] Redirecting to next", { next, totalDuration });
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[AUTH CALLBACK] Code exchange error", error);
  }

  const totalDuration = Date.now() - startTime;
  console.log("[AUTH CALLBACK] Redirecting to login with error", { totalDuration });
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
