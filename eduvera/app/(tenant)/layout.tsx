import { ShellLayout } from "@/components/shared/ShellLayout";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellLayout>
      {children}
    </ShellLayout>
  );
}
