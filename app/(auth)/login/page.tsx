import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in | Lumintu Suite",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {params.reset === "success" ? (
        <p className="max-w-md rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-700">
          Password updated successfully. You can sign in with your new password.
        </p>
      ) : null}
      <LoginForm />
    </div>
  );
}
