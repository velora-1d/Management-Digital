import { ShellLayout } from "@/components/shared/ShellLayout";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellLayout>
      {children}
    </ShellLayout>
  );
}
