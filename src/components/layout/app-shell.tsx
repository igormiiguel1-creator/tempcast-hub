"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { MainSidebar } from "@/components/layout/main-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { QuickActionsModals } from "@/components/layout/quick-actions-modals";
import { AppProvider, useAppData } from "@/lib/app-state";

type AppShellProps = {
  children: React.ReactNode;
};

function AppShellContent({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setCommandPaletteOpen, setSearchQuery } = useAppData();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setCommandPaletteOpen, setSearchQuery]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(212,167,50,0.07),transparent_30%),var(--background)]">
      <MainSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 px-1 pb-8 pt-2 sm:px-2 lg:px-0">{children}</main>
      </div>
      <CommandPalette />
      <QuickActionsModals />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AppProvider>
      <AppShellContent>{children}</AppShellContent>
    </AppProvider>
  );
}
