"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search as SearchIcon,
  Sparkles,
  PlusCircle,
  Bell,
  BellRing,
  Check,
  CheckSquare,
  AlertTriangle,
  FileText,
  UserPlus,
  Network,
  Handshake,
  Mic,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/config/navigation";
import { useAppData } from "@/lib/app-state";

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
  type: string;
  href: string;
}

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    setCommandPaletteOpen,
    searchQuery,
    setSearchQuery,
    globalSearchResults,
    episodes,
    tasks,
    guests,
    partners,
  } = useAppData();

  const [actionsOpen, setActionsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("tempcast-read-notifications");
    if (saved) {
      setReadIds(JSON.parse(saved));
    }
  }, []);

  const saveReadIds = (ids: string[]) => {
    setReadIds(ids);
    localStorage.setItem("tempcast-read-notifications", JSON.stringify(ids));
  };

  const currentPage = navigationItems.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Gerar notificações dinâmicas
  const allNotifications = useMemo<NotificationItem[]>(() => {
    const list: NotificationItem[] = [];

    // 1. Tarefa em atraso
    tasks.forEach((t) => {
      if (t.dueDate && t.dueDate < todayStr && t.section !== "Completed") {
        list.push({
          id: `task-overdue-${t.id}`,
          title: "Tarefa em atraso",
          detail: `"${t.title}" devia ter sido entregue a ${t.dueDate}.`,
          priority: "high",
          type: "task",
          href: "/tarefas",
        });
      }
    });

    // 2. Thumbnail em falta
    episodes.forEach((e) => {
      if (e.status === "Editing") {
        const hasThumb = e.checklist?.some((c) => c.label.toLowerCase().includes("thumb") && c.checked);
        if (!hasThumb) {
          list.push({
            id: `ep-thumb-${e.id}`,
            title: "Thumbnail em falta",
            detail: `O episódio "${e.title}" precisa de arte final.`,
            priority: "medium",
            type: "episode",
            href: "/centro-producao",
          });
        }
      }
    });

    // 3. SEO incompleto
    episodes.forEach((e) => {
      if (e.status === "Editing") {
        const hasSeo = e.checklist?.some((c) => c.label.toLowerCase().includes("seo") && c.checked);
        if (!hasSeo) {
          list.push({
            id: `ep-seo-${e.id}`,
            title: "SEO incompleto",
            detail: `Tags e notas de SEO em falta no episódio "${e.title}".`,
            priority: "medium",
            type: "episode",
            href: "/centro-producao",
          });
        }
      }
    });

    // 4. Convidado sem data de gravação
    guests.forEach((g) => {
      if (g.status === "Confirmed" && (!g.recordingDate || g.recordingDate === "TBD")) {
        list.push({
          id: `guest-tbd-${g.id}`,
          title: "Convidado por agendar",
          detail: `Definir data de gravação para o convidado "${g.name}".`,
          priority: "medium",
          type: "guest",
          href: "/convidados",
        });
      }
    });

    // 5. Parceiro próximo da renovação
    partners.forEach((p) => {
      if (p.renewalDate && p.renewalDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) {
        list.push({
          id: `partner-renew-${p.id}`,
          title: "Contrato de Parceiro",
          detail: `O contrato da marca "${p.name}" expira em breve.`,
          priority: "low",
          type: "partner",
          href: "/parceiros",
        });
      }
    });

    return list;
  }, [tasks, episodes, guests, partners, todayStr]);

  const unreadNotifications = useMemo(() => {
    return allNotifications.filter((n) => !readIds.includes(n.id));
  }, [allNotifications, readIds]);

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      saveReadIds([...readIds, id]);
    }
  };

  const markAllAsRead = () => {
    const allIds = allNotifications.map((n) => n.id);
    saveReadIds(allIds);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Botão Menu Mobile */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        aria-label="Abrir navegação"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Título da Página Atual */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          TempCast Hub v1.0 RC
        </div>
        <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">
          {currentPage?.title ?? "Dashboard"}
        </h1>
      </div>

      {/* Ferramentas */}
      <div className="flex items-center gap-2 shrink-0">
        {/* MENU AÇÕES RÁPIDAS */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActionsOpen(!actionsOpen)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary-hover hover:-translate-y-0.5"
            title="Ações Rápidas"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Criar</span>
          </button>

          {actionsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setActionsOpen(false)} />
              <div className="absolute right-0 mt-2 z-50 w-52 rounded-2xl border border-border/80 bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <p className="text-[10px] font-bold text-muted-foreground px-2.5 py-1 uppercase tracking-wider">Ações Rápidas</p>
                {[
                  { label: "Novo Episódio", type: "episode", icon: Mic },
                  { label: "Novo Convidado", type: "guest", icon: UserPlus },
                  { label: "Nova Tarefa", type: "task", icon: CheckSquare },
                  { label: "Novo Parceiro", type: "partner", icon: Handshake },
                  { label: "Post Social", type: "social", icon: Network },
                  { label: "Nota Rápida", type: "note", icon: FileText },
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.label}
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("open-quick-modal", { detail: act.type }));
                        setActionsOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-foreground hover:bg-muted/70 transition-all"
                    >
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      {act.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* PESQUISA DE COMANDO */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground hover:border-primary/30 transition-all"
          title="Command Palette (Ctrl + K)"
        >
          <SearchIcon className="h-4.5 w-4.5" />
        </button>

        {/* CENTRO DE NOTIFICAÇÕES */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/70 text-muted-foreground hover:border-primary/30 transition-all"
            title="Centro de Notificações"
          >
            {unreadNotifications.length > 0 ? (
              <>
                <BellRing className="h-4.5 w-4.5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                  {unreadNotifications.length}
                </span>
              </>
            ) : (
              <Bell className="h-4.5 w-4.5" />
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-border/80 bg-card p-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                  <span className="text-xs font-bold">Alertas Operacionais ({unreadNotifications.length})</span>
                  {unreadNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[10px] text-primary font-bold hover:underline"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                {unreadNotifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center justify-center">
                    <Check className="h-8 w-8 text-primary mb-1.5" />
                    Sem novos alertas por hoje.
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-72">
                    {unreadNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          setNotificationsOpen(false);
                          router.push(notif.href);
                        }}
                        className={`flex items-start gap-2 rounded-xl p-2.5 border transition-all cursor-pointer ${
                          notif.priority === "high"
                            ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                            : "bg-background/80 border-border hover:border-primary/40"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {notif.priority === "high" ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Bell className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-semibold text-foreground flex items-center justify-between">
                            {notif.title}
                            {notif.priority === "high" && (
                              <span className="text-[8px] bg-red-500/10 text-red-500 px-1 rounded font-bold uppercase">Urgente</span>
                            )}
                          </p>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">{notif.detail}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="shrink-0 p-1 hover:bg-muted text-muted-foreground rounded"
                          title="Marcar como lida"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <ThemeToggle />
      </div>

      {/* Barra de Pesquisa Global */}
      <div className="hidden w-full max-w-xs xl:max-w-md items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground md:flex">
        <SearchIcon className="h-4 w-4" />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Pesquisar episódios, convidados..."
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-xs"
        />
        {globalSearchResults.length > 0 ? (
          <div className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.24em] text-primary">
            {globalSearchResults.length} matches
          </div>
        ) : null}
      </div>
    </header>
  );
}
