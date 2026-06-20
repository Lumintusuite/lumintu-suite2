import { redirect } from "next/navigation";

import {
  adminNavItems,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard | Lumintu Suite",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/member");
  }

  return (
    <DashboardShell
      title="Lumintu Suite"
      subtitle="Administration"
      navItems={adminNavItems}
      email={user.email}
      fullName={user.name || user.email}
      roleLabel="Administrator"
    >
      {children}
    </DashboardShell>
  );
}
