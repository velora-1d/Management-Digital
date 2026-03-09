import { ShellLayout } from "@/components/shared/ShellLayout";

export default function YayasanLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShellLayout>
      {children}
    </ShellLayout>
  );
}
