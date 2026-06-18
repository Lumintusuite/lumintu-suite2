import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset password | Lumintu Suite",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex w-full justify-center">
      <ResetPasswordForm />
    </div>
  );
}
