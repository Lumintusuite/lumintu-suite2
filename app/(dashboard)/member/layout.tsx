import { redirect } from "next/navigation";

import {
  DashboardShell,
  memberNavItems,
} from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Member Dashboard | Lumintu Suite",
};

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  return (
    <DashboardShell
      title="Lumintu Suite"
      subtitle="Member portal"
      navItems={memberNavItems}
      email={user.email}
      fullName={user.name || user.email}
      roleLabel="Member"
    >
      {children}
    </DashboardShell>
  );
}
