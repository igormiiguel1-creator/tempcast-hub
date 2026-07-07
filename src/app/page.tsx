"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Clock3,
  ExternalLink,
  Mic2,
  PlayCircle,
  Sparkles,
  TrendingUp,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-state";

function Sparkline({ data, trend }: { data: number[]; trend: "up" | "down" | "warning" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const color = trend === "up" ? "#d4a732" : trend === "warning" ? "#ff6b5b" : "#99958a";

  return (
    <svg className="h-8 w-24 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function Home() {
  const {
    episodes,
    tasks,
    guests,
    calendarEvents,
    socialPosts,
    isLoading,
  } = useAppData();

  const dateFormatted = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("pt-PT", options);
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const todayRecordings = useMemo(() => {
    return calendarEvents.filter(
      (e) => e.date === todayStr && (e.type === "Recording" || e.type === "Meeting")
    );
  }, [calendarEvents, todayStr]);

  const todayTasksList = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr && t.section !== "Completed");
  }, [tasks, todayStr]);

  const todayPostsList = useMemo(() => {
    return socialPosts.filter(
      (p) => p.scheduledFor?.startsWith(todayStr) && p.status !== "Published"
    );
  }, [socialPosts, todayStr]);

  const aiRecommendations = useMemo(() => {
    const recs: string[] = [];

    const overdue = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.section !== "Completed");
    if (overdue.length > 0) {
      recs.push(`Tens ${overdue.length} tarefas em atraso que necessitam de intervenção imediata.`);
    }

    const missingThumb = episodes.filter(
      (e) =>
        e.status === "Editing" &&
        !e.checklist?.some((c) => c.label.toLowerCase().includes("thumb") && c.checked)
    );
    if (missingThumb.length > 0) {
      recs.push(
        `Falta carregar a Thumbnail para o episódio: "${missingThumb[0].title}" (fase de Edição).`
      );
    }

    const missingSeo = episodes.filter(
      (e) =>
        e.status === "Editing" &&
        !e.checklist?.some((c) => c.label.toLowerCase().includes("seo") && c.checked)
    );
    if (missingSeo.length > 0) {
      recs.push(
        `Configuração de SEO pendente para o episódio: "${missingSeo[0].title}".`
      );
    }

    const pendingGuests = guests.filter((g) => g.status === "Idea" || g.status === "Contacted");
    if (pendingGuests.length > 3) {
      recs.push(`Tens ${pendingGuests.length} ideias de convidados por qualificar ou negociar.`);
    }

    if (recs.length === 0) {
      recs.push("Todos os episódios ativos têm thumbnail, SEO e tarefas em dia. Bom trabalho!");
    }

    return recs;
  }, [episodes, tasks, guests, todayStr]);

  const kpis = useMemo(() => {
    return [
      {
        title: "Episódios este mês",
        value: episodes.length.toString(),
        change: "+12%",
        trend: "up" as const,
        context: "vs. mês anterior",
        statusText: "Estável",
        sparklineData: [10, 12, 11, 14, 13, 16, 18],
        icon: Clapperboard,
        color: "text-primary bg-primary/10",
      },
      {
        title: "Convidados activos",
        value: guests.filter(g => g.status === "Confirmed").length.toString(),
        change: "+25%",
        trend: "up" as const,
        context: "confirmados e prontos",
        statusText: "Excelente",
        sparklineData: [4, 5, 5, 7, 6, 8, 9],
        icon: Mic2,
        color: "text-amber-500 bg-amber-500/10",
      },
      {
        title: "Vídeos pendentes",
        value: episodes.filter(e => e.status === "Editing").length.toString(),
        change: "Atenção",
        trend: "warning" as const,
        context: "em pós-produção",
        statusText: "Revisão",
        sparklineData: [6, 7, 5, 8, 4, 6, 5],
        icon: PlayCircle,
        color: "text-red-500 bg-red-500/10",
      },
      {
        title: "Posts agendados",
        value: socialPosts.filter(p => p.status === "Scheduled").length.toString(),
        change: "+5%",
        trend: "up" as const,
        context: "nas redes sociais",
        statusText: "Pronto",
        sparklineData: [12, 10, 11, 9, 14, 13, 15],
        icon: TrendingUp,
        color: "text-emerald-500 bg-emerald-500/10",
      },
    ];
  }, [episodes, guests, socialPosts]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div className="h-40 skeleton rounded-[28px]" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-32 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Hero / Agenda do dia */}
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Consola Operacional
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Bem-vindo, Igor</h2>
              <p className="mt-2 text-base text-muted-foreground capitalize">
                {dateFormatted}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/centro-producao" className="btn-brand">
              <Clapperboard className="h-4 w-4" />
              Centro de Produção
            </Link>
            <Link
              href="/ia"
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border/70 bg-background/80 px-5 py-2 text-sm font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-primary/30 hover:bg-accent/70"
            >
              Perguntar à IA
            </Link>
          </div>
        </div>
      </section>

      {/* Grid de KPIs com Sparklines e Status Badges */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.title} className="brand-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{kpi.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                    kpi.trend === "up"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : kpi.trend === "warning"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {kpi.statusText}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h3 className="text-3xl font-bold tracking-tight">{kpi.value}</h3>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-primary">{kpi.change}</span>
                    <span className="text-[10px] text-muted-foreground">{kpi.context}</span>
                  </div>
                </div>
              </div>

              {/* Sparkline Visual */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                <Sparkline data={kpi.sparklineData} trend={kpi.trend} />
                <div className={`p-2 rounded-xl ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Conteúdo Principal — O que fazer hoje? */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          {/* Hoje no TempCast */}
          <section className="brand-card p-6">
            <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary" />
              Hoje no TempCast
            </h3>

            {todayRecordings.length === 0 && todayTasksList.length === 0 && todayPostsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <p className="text-sm font-semibold">Tudo calmo por hoje!</p>
                <p className="text-xs text-muted-foreground">Não tens gravações ou tarefas agendadas para hoje.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayRecordings.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-3">
                      <Mic2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-bold">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">Gravação agendada para hoje</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{rec.time || "Hora TBD"}</span>
                  </div>
                ))}

                {todayTasksList.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-2xl border border-border bg-background/50 p-4">
                    <div className="flex items-center gap-3">
                      <Clock3 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Tarefa pendente para hoje</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500 font-semibold">Hoje</span>
                  </div>
                ))}

                {todayPostsList.map((post) => (
                  <div key={post.id} className="flex items-center justify-between rounded-2xl border border-border bg-background/50 p-4">
                    <div className="flex items-center gap-3">
                      <PlayCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{post.content.slice(0, 50)}...</p>
                        <p className="text-xs text-muted-foreground">Post agendado ({post.platform})</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{post.scheduledFor?.split(" ")[1] || "Agendado"}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pipeline de Produção (Centro de Produção rápido) */}
          <section className="brand-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">Estado de Produção</h3>
              <Link href="/centro-producao" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Ver pipeline <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {episodes.slice(0, 3).map((episode) => (
                <div key={episode.id} className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-background/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{episode.title}</p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {episode.status}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width:
                          episode.status === "Published"
                            ? "100%"
                            : episode.status === "Editing"
                            ? "70%"
                            : episode.status === "Recorded"
                            ? "50%"
                            : episode.status === "Scheduled"
                            ? "40%"
                            : "20%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Barra Lateral — Co-Piloto de IA e Recomendações */}
        <aside className="space-y-6">
          <section className="brand-card p-6 border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Sparkles className="h-4.5 w-4.5" />
              Co-Piloto TempCast
            </div>
            <p className="mt-3 text-base font-semibold tracking-tight">Recomendações Operacionais</p>

            <div className="mt-4 space-y-3">
              {aiRecommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-sm text-muted-foreground bg-background/50 rounded-2xl p-3 border border-border/40">
                  <AlertCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            <Link href="/ia">
              <Button className="mt-5 w-full btn-brand text-xs">
                Abrir Consola de IA
              </Button>
            </Link>
          </section>

          {/* Agenda de Convidados */}
          <section className="brand-card p-6">
            <h3 className="text-lg font-bold tracking-tight mb-4">Próximos Convidados</h3>
            <div className="space-y-3">
              {guests.slice(0, 3).map((guest) => (
                <div key={guest.id} className="flex items-center justify-between rounded-xl p-2.5 border border-border/50 bg-background/40">
                  <div>
                    <p className="text-sm font-semibold">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">{guest.profession} · {guest.company}</p>
                  </div>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                    guest.status === "Confirmed"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {guest.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
