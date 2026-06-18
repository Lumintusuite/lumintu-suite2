import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <span className="font-heading text-2xl font-semibold tracking-tight">
            Lumintu Suite
          </span>
        </Link>
      </div>
      {children}
    </div>
  );
}
