import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  return (
    <DashboardShell user={{ name: user.name, role: user.role }}>
      {children}
    </DashboardShell>
  );
}
