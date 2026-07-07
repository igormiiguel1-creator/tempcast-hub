"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { navigationItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type MainSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MainSidebar({ isOpen, onClose }: MainSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/70 bg-sidebar/95 text-sidebar-foreground shadow-[24px_0_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/70 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={onClose}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 p-2 shadow-sm">
              <Image src="/Brand/TempCast_Logo.png" alt="TempCast logo" width={28} height={28} />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-[0.95rem] font-semibold tracking-tight">TempCast Hub</span>
              <span className="block truncate text-xs text-muted-foreground">Operação interna</span>
            </div>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Fechar navegação"
            title="Fechar navegação"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal">
          {navigationItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(31,122,109,0.12)]"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl",
                    isActive ? "bg-primary/15 text-primary" : "bg-background/70 text-sidebar-foreground/70 group-hover:bg-primary/10",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
