import { ShellLayout } from "@/components/shared/ShellLayout";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellLayout>
      {children}
    </ShellLayout>
  );
}
