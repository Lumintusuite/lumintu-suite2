import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Register | Lumintu Suite",
};

export default function RegisterPage() {
  return (
    <div className="flex w-full justify-center">
      <RegisterForm />
    </div>
  );
}
