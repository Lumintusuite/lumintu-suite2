import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot password | Lumintu Suite",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-full justify-center">
      <ForgotPasswordForm />
    </div>
  );
}
