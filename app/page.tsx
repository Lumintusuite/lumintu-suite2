import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Lumintu Suite
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            Authentication &amp; role-based dashboards
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Sprint 1 foundation with Supabase auth, admin and member roles, and
            protected dashboard layouts.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create account</Link>
          </Button>
        </div>

        <Card className="w-full max-w-xl text-left">
          <CardHeader>
            <CardTitle>Sprint 1 includes</CardTitle>
            <CardDescription>
              See <code className="text-xs">docs/sprint-1.md</code> for setup
              instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Login, register, and forgot-password flows</li>
              <li>Supabase profiles with admin/member roles</li>
              <li>Middleware route protection</li>
              <li>Separate admin and member dashboard shells</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
