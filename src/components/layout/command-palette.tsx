"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bot,
  CalendarDays,
  FileDown,
  Mic2,
  Search,
  Sparkles,
  Users,
  Wallet,
  Settings,
  Clapperboard,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppData } from "@/lib/app-state";

interface CommandItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href?: string;
  isExecutable?: boolean;
  action?: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { commandPaletteOpen, setCommandPaletteOpen, setSearchQuery } = useAppData();
  const [query, setQuery] = useState("");

  // Fechar Command Palette no Esc
  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery("");
    }
  }, [commandPaletteOpen]);

  // Lista de comandos executáveis e de navegação
  const commands = useMemo<CommandItem[]>(() => {
    return [
      {
        title: "> Criar Episódio",
        description: "Abrir formulário de criação rápida de episódio",
        icon: Mic2,
        isExecutable: true,
        action: () => {
          window.dispatchEvent(new CustomEvent("open-quick-modal", { detail: "episode" }));
        },
      },
      {
        title: "> Adicionar Convidado",
        description: "Abrir formulário de registo de novo convidado",
        icon: Users,
        isExecutable: true,
        action: () => {
          window.dispatchEvent(new CustomEvent("open-quick-modal", { detail: "guest" }));
        },
      },
      {
        title: "> Criar Tarefa",
        description: "Abrir formulário de criação de nova tarefa operacional",
        icon: Terminal,
        isExecutable: true,
        action: () => {
          window.dispatchEvent(new CustomEvent("open-quick-modal", { detail: "task" }));
        },
      },
      {
        title: "> Alternar Tema (Dark/Light)",
        description: "Mudar o visual da aplicação entre modo escuro e claro",
        icon: Settings,
        isExecutable: true,
        action: () => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
        },
      },
      {
        title: "> Limpar Alertas",
        description: "Marcar todas as notificações do cabeçalho como lidas",
        icon: FileDown,
        isExecutable: true,
        action: () => {
          localStorage.setItem("tempcast-read-notifications", JSON.stringify([]));
          // Forçar recarga simples
          window.dispatchEvent(new Event("storage"));
        },
      },
      {
        title: "Ver Centro de Produção",
        description: "Acompanhar o pipeline dos episódios",
        icon: Clapperboard,
        href: "/centro-producao",
      },
      {
        title: "Abrir IA Co-Piloto",
        description: "Ir para a consola inteligente de conversação",
        icon: Bot,
        href: "/ia",
      },
      {
        title: "Ver Calendário",
        description: "Ir para a visualização de gravações e eventos",
        icon: CalendarDays,
        href: "/calendario",
      },
      {
        title: "Ir para Relatórios",
        description: "Exportações PDF/Excel e estatísticas",
        icon: FileDown,
        href: "/relatorios",
      },
      {
        title: "Ir para Configurações",
        description: "Credenciais de API e dados de estúdio",
        icon: Settings,
        href: "/configuracoes",
      },
    ];
  }, [resolvedTheme, setTheme]);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) =>
      `${command.title} ${command.description}`.toLowerCase().includes(normalized)
    );
  }, [query, commands]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/40 flex items-start justify-center pt-20 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="brand-panel w-full max-w-2xl p-4 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        {/* Input */}
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-3.5 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Escreve um comando (ex: > Criar) ou navegação..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground border">
            Esc
          </kbd>
        </div>

        {/* Lista */}
        <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              Nenhum comando ou página encontrada.
            </div>
          ) : (
            filteredCommands.map((command) => {
              const Icon = command.icon;
              return (
                <button
                  key={command.title}
                  type="button"
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    if (command.isExecutable && command.action) {
                      command.action();
                    } else if (command.href) {
                      router.push(command.href);
                    }
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-border/40 bg-background/45 px-3.5 py-2.5 text-left transition hover:border-primary/40 hover:bg-background/90"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{command.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{command.description}</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-primary/15 text-primary border border-primary/20 rounded px-2 py-0.5 font-bold uppercase tracking-wider">
                    {command.isExecutable ? "Comando" : "Navegar"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
