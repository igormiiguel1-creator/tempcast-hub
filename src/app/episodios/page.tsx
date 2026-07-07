"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  CirclePlus,
  Clock3,
  Copy,
  FileText,
  Filter,
  ListChecks,
  Mic2,
  PencilLine,
  Search,
  Sparkles,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EpisodeStatus =
  | "Ideia"
  | "Contactado"
  | "Confirmado"
  | "Guião"
  | "Agendado"
  | "Gravado"
  | "Em edição"
  | "Shorts"
  | "Publicado";

type EpisodePriority = "Alta" | "Média" | "Baixa";

type Episode = {
  id: number;
  title: string;
  guest: string;
  status: EpisodeStatus;
  recordingDate: string;
  publicationDate: string;
  priority: EpisodePriority;
  summary: string;
  checklist: string[];
  notes: string;
  timeline: Array<{ label: string; value: string }>;
};

const episodes: Episode[] = [
  {
    id: 1,
    title: "Episódio #12 · O ritmo da criação",
    guest: "Sofia Vale",
    status: "Agendado",
    recordingDate: "18 Jul · 15:00",
    publicationDate: "25 Jul",
    priority: "Alta",
    summary: "Gravação em estúdio com foco na narrativa do novo ciclo editorial.",
    checklist: [
      "Confirmar equipamento de áudio",
      "Enviar briefing ao convidado",
      "Definir abertura do episódio",
      "Revisar capa para Shorts",
    ],
    notes:
      "O convidado prefere um ritmo mais pausado nas primeiras 8 minutos. Manter espaço para reflexão e exemplos visuais.",
    timeline: [
      { label: "Ideia", value: "12 Jun" },
      { label: "Contactado", value: "14 Jun" },
      { label: "Confirmado", value: "20 Jun" },
      { label: "Agendado", value: "02 Jul" },
    ],
  },
  {
    id: 2,
    title: "Episódio #11 · Sistemas criativos",
    guest: "Rui Fonseca",
    status: "Em edição",
    recordingDate: "09 Jul · 10:30",
    publicationDate: "17 Jul",
    priority: "Média",
    summary: "Conversa sobre produtividade, estrutura e ferramentas para criar com consistência.",
    checklist: [
      "Editar introdução",
      "Adicionar música de abertura",
      "Validar transcrição",
      "Enviar para revisão",
    ],
    notes: "A conversa ficou muito rica. A versão final deve ganhar ritmo no meio do episódio.",
    timeline: [
      { label: "Guião", value: "01 Jul" },
      { label: "Gravado", value: "09 Jul" },
      { label: "Em edição", value: "10 Jul" },
    ],
  },
  {
    id: 3,
    title: "Episódio #10 · Crescer sem ruído",
    guest: "Ana Teixeira",
    status: "Publicado",
    recordingDate: "02 Jul · 12:00",
    publicationDate: "05 Jul",
    priority: "Baixa",
    summary: "Acompanhamento editorial sobre foco, decisão e the work behind the work.",
    checklist: [
      "Publicar no YouTube",
      "Partilhar recap no Instagram",
      "Adicionar CTA para newsletter",
    ],
    notes: "O episódio teve boa retenção. Pode ser reutilizado para um short no final da semana.",
    timeline: [
      { label: "Confirmado", value: "20 Jun" },
      { label: "Gravado", value: "02 Jul" },
      { label: "Publicado", value: "05 Jul" },
    ],
  },
  {
    id: 4,
    title: "Episódio #09 · O valor do silêncio",
    guest: "Miguel Lemos",
    status: "Confirmado",
    recordingDate: "24 Jul · 16:30",
    publicationDate: "31 Jul",
    priority: "Alta",
    summary: "Um episódio de reflexão sobre presença, comunicação e decisão em contexto criativo.",
    checklist: [
      "Confirmar tema principal",
      "Enviar perguntas de abertura",
      "Reservar estúdio",
    ],
    notes: "O convidado pede uma estrutura mais conversacional e menos formal.",
    timeline: [
      { label: "Contactado", value: "20 Jun" },
      { label: "Confirmado", value: "27 Jun" },
    ],
  },
  {
    id: 5,
    title: "Episódio #08 · Depois do primeiro vídeo",
    guest: "Marta Costa",
    status: "Shorts",
    recordingDate: "14 Jul · 09:00",
    publicationDate: "16 Jul",
    priority: "Média",
    summary: "Versão curta voltada para redes com destaque para os momentos mais fortes da conversa.",
    checklist: ["Selecionar melhores clips", "Criar legenda", "Definir thumbnail"],
    notes: "Três momentos têm potencial de virar shorts com boa retenção.",
    timeline: [
      { label: "Gravado", value: "14 Jul" },
      { label: "Shorts", value: "15 Jul" },
    ],
  },
];

const filters: Array<{ label: string; value: EpisodeStatus | "Todos" }> = [
  { label: "Todos", value: "Todos" },
  { label: "Ideia", value: "Ideia" },
  { label: "Contactado", value: "Contactado" },
  { label: "Confirmado", value: "Confirmado" },
  { label: "Guião", value: "Guião" },
  { label: "Agendado", value: "Agendado" },
  { label: "Gravado", value: "Gravado" },
  { label: "Em edição", value: "Em edição" },
  { label: "Shorts", value: "Shorts" },
  { label: "Publicado", value: "Publicado" },
];

const kpis = [
  { title: "Episódios publicados", value: "24", detail: "+3 este mês", icon: CheckCircle2, accent: "bg-emerald-500/10 text-emerald-600" },
  { title: "Em produção", value: "6", detail: "2 próximos a gravar", icon: Clock3, accent: "bg-amber-500/10 text-amber-600" },
  { title: "Agendados", value: "4", detail: "Prontos para a semana", icon: CirclePlus, accent: "bg-sky-500/10 text-sky-600" },
  { title: "Tempo médio de produção", value: "14d", detail: "Mais previsível", icon: TrendingUp, accent: "bg-primary/10 text-primary" },
];

export default function EpisodiosPage() {
  const [activeFilter, setActiveFilter] = useState<EpisodeStatus | "Todos">("Todos");
  const [query, setQuery] = useState("");
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(episodes[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredEpisodes = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return episodes.filter((episode) => {
      const matchesFilter = activeFilter === "Todos" || episode.status === activeFilter;
      const matchesQuery =
        episode.title.toLowerCase().includes(normalizedQuery) ||
        episode.guest.toLowerCase().includes(normalizedQuery) ||
        episode.status.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  useEffect(() => {
    if (!filteredEpisodes.some((episode) => episode.id === selectedEpisode?.id)) {
      setSelectedEpisode(filteredEpisodes[0] ?? null);
    }
  }, [filteredEpisodes, selectedEpisode]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="flex flex-col gap-6 rounded-[28px] border border-border/70 bg-card p-6 shadow-sm sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Operação editorial
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Episódios</h2>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">Gerir toda a produção do TempCast.</p>
          </div>
        </div>
        <Button className="w-full rounded-full sm:w-auto">
          <CirclePlus className="h-4 w-4" />
          Novo Episódio
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">{item.value}</p>
                </div>
                <div className={cn("rounded-2xl p-3", item.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>{item.detail}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-border/70 bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Procurar por episódio, convidado ou estado"
              className="h-11 w-full rounded-full border border-border/70 bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtros
            </div>
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-all duration-200",
                  activeFilter === filter.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/70 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lista de episódios</p>
                <h3 className="text-lg font-semibold tracking-tight">Produção atual</h3>
              </div>
              <div className="rounded-full border border-border/70 bg-background px-3 py-1 text-sm text-muted-foreground">
                {filteredEpisodes.length} resultados
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-4 sm:p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="mb-3 h-4 w-1/3 rounded-full bg-muted" />
                  <div className="h-3 w-2/3 rounded-full bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <ListChecks className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">Nenhum episódio encontrado</h4>
                <p className="mt-1 text-sm text-muted-foreground">Ajusta os filtros ou tenta uma pesquisa diferente.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-background/70 text-muted-foreground">
                    <th className="px-4 py-3 font-medium sm:px-6">Título</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Convidado</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Estado</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Data de gravação</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Data de publicação</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Prioridade</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEpisodes.map((episode) => (
                    <tr
                      key={episode.id}
                      onClick={() => setSelectedEpisode(episode)}
                      className={cn(
                        "cursor-pointer border-b border-border/60 last:border-0 transition-colors duration-200 hover:bg-accent/50",
                        selectedEpisode?.id === episode.id && "bg-accent/40",
                      )}
                    >
                      <td className="px-4 py-3 font-medium sm:px-6">{episode.title}</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-6">{episode.guest}</td>
                      <td className="px-4 py-3 sm:px-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {episode.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-6">{episode.recordingDate}</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-6">{episode.publicationDate}</td>
                      <td className="px-4 py-3 sm:px-6">
                        <span className="text-sm font-medium text-foreground">{episode.priority}</span>
                      </td>
                      <td className="px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Editar episódio"
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                          >
                            <PencilLine className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Duplicar episódio"
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          {selectedEpisode ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Detalhes do episódio</p>
                    <h3 className="text-xl font-semibold tracking-tight">{selectedEpisode.title}</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Mic2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selectedEpisode.summary}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Convidado</p>
                  <p className="mt-1 font-medium">{selectedEpisode.guest}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Prioridade</p>
                  <p className="mt-1 font-medium">{selectedEpisode.priority}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ListChecks className="h-4 w-4 text-primary" />
                  Checklist
                </div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {selectedEpisode.checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-primary" />
                  Notas
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{selectedEpisode.notes}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Ficheiros anexados
                </div>
                <div className="mt-3 rounded-2xl border border-dashed border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
                  Nenhum ficheiro anexado ainda.
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Linha temporal
                </div>
                <div className="mt-4 space-y-3">
                  {selectedEpisode.timeline.map((step) => (
                    <div key={step.label} className="flex items-center justify-between rounded-xl bg-background/80 px-3 py-2 text-sm">
                      <span className="font-medium">{step.label}</span>
                      <span className="text-muted-foreground">{step.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full">
                  <PencilLine className="h-4 w-4" />
                  Editar
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Copy className="h-4 w-4" />
                  Duplicar
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Archive className="h-4 w-4" />
                  Arquivar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-88 items-center justify-center text-center text-sm text-muted-foreground">
              Seleciona um episódio para ver os detalhes.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}