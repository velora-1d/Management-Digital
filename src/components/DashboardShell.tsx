"use client";
import { useState, useEffect, type ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";

interface DashboardShellProps {
  user: { name: string; role: string };
  children: ReactNode;
}

import { HelpProvider } from "@/components/HelpContext";
import HelpDrawer from "@/components/HelpDrawer";
import HelpFAB from "@/components/HelpFAB";
import MutationChecker from "@/components/MutationChecker";

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  function handleToggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <HelpProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Sidebar user={user} collapsed={collapsed} onToggle={handleToggle} />
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
          <Header user={user} />
          <div className="flex-1 overflow-auto custom-scrollbar">
            <div className="p-6 md:p-8 space-y-8 min-h-[calc(100vh-64px)] w-full">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </div>
        </main>
      </div>
      <MutationChecker user={user} />
      <HelpDrawer />
      <HelpFAB />
    </HelpProvider>
  );
}
