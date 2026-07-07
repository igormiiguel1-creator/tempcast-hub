"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Filter,
  Radio,
  Sparkles,
  TrendingUp,
  Video,
  Send,
  MessageCircleMore,
  PlayCircle,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Users,
  Clock,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-state";

const platforms = ["Combined", "YouTube", "Instagram", "Facebook", "TikTok", "Spotify"] as const;
type PlatformType = (typeof platforms)[number];

// Helper para gráfico de linha simples em SVG
function MiniAreaChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 500;
  const height = 150;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <svg className="w-full h-36 overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#gradient-${color})`} />
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function RedesSociaisPage() {
  const { socialPosts, isLoading } = useAppData();
  const [activePlatform, setActivePlatform] = useState<PlatformType>("Combined");

  // Dados Analíticos Dinâmicos baseados no provedor selecionado
  const analyticsData = useMemo(() => {
    const dataMap: Record<PlatformType, {
      views: string; viewsVal: number;
      likes: string; likesVal: number;
      comments: string; commentsVal: number;
      shares: string; sharesVal: number;
      followers: string; followersLabel: string;
      reach: string;
      watchTime: string;
      engagement: string;
      growth: string;
      revenue: string;
      chartData: number[];
      chartColor: string;
    }> = {
      Combined: {
        views: "1.45M", viewsVal: 1450000,
        likes: "128.4K", likesVal: 128400,
        comments: "14.2K", commentsVal: 14200,
        shares: "28.6K", sharesVal: 28600,
        followers: "42.8K", followersLabel: "Seguidores Totais",
        reach: "980K",
        watchTime: "245.8K hrs",
        engagement: "7.8%",
        growth: "+14.2%",
        revenue: "€1,245.50",
        chartData: [45, 52, 49, 62, 58, 74, 85, 80, 95, 110, 105, 128],
        chartColor: "#d4a732",
      },
      YouTube: {
        views: "820K", viewsVal: 820000,
        likes: "64.2K", likesVal: 64200,
        comments: "8.5K", commentsVal: 8500,
        shares: "12.4K", sharesVal: 12400,
        followers: "18.5K", followersLabel: "Subscritores",
        reach: "450K",
        watchTime: "180.2K hrs",
        engagement: "9.2%",
        growth: "+18.5%",
        revenue: "€840.00",
        chartData: [20, 25, 28, 35, 32, 40, 48, 45, 52, 60, 58, 64],
        chartColor: "#ff6b5b",
      },
      Instagram: {
        views: "340K", viewsVal: 340000,
        likes: "45.0K", likesVal: 45000,
        comments: "4.1K", commentsVal: 4100,
        shares: "11.2K", sharesVal: 11200,
        followers: "15.2K", followersLabel: "Seguidores",
        reach: "380K",
        watchTime: "45.2K hrs",
        engagement: "6.8%",
        growth: "+11.2%",
        revenue: "€250.50",
        chartData: [15, 18, 22, 20, 24, 28, 32, 30, 35, 38, 42, 45],
        chartColor: "#ec4899",
      },
      Facebook: {
        views: "95K", viewsVal: 95000,
        likes: "8.2K", likesVal: 8200,
        comments: "620", commentsVal: 620,
        shares: "1.8K", sharesVal: 1800,
        followers: "4.8K", followersLabel: "Seguidores",
        reach: "120K",
        watchTime: "12.4K hrs",
        engagement: "3.4%",
        growth: "+4.8%",
        revenue: "€45.00",
        chartData: [5, 6, 8, 7, 9, 8, 10, 9, 11, 10, 9, 8],
        chartColor: "#3b82f6",
      },
      TikTok: {
        views: "180K", viewsVal: 180000,
        likes: "10.5K", likesVal: 10500,
        comments: "850", commentsVal: 850,
        shares: "3.1K", sharesVal: 3100,
        followers: "3.5K", followersLabel: "Seguidores",
        reach: "160K",
        watchTime: "7.8K hrs",
        engagement: "8.1%",
        growth: "+22.4%",
        revenue: "€110.00",
        chartData: [2, 3, 5, 8, 10, 9, 12, 11, 15, 14, 13, 10],
        chartColor: "#22c55e",
      },
      Spotify: {
        views: "15K", viewsVal: 15000,
        likes: "520", likesVal: 520,
        comments: "130", commentsVal: 130,
        shares: "110", sharesVal: 110,
        followers: "850", followersLabel: "Ouvintes",
        reach: "18K",
        watchTime: "620 hrs",
        engagement: "12.4%",
        growth: "+8.5%",
        revenue: "€0.00",
        chartData: [1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5],
        chartColor: "#1db954",
      },
    };

    return dataMap[activePlatform];
  }, [activePlatform]);

  const visiblePosts = useMemo(() => {
    if (activePlatform === "Combined") return socialPosts;
    return socialPosts.filter((post) => post.platform === activePlatform);
  }, [activePlatform, socialPosts]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div className="h-40 skeleton rounded-[28px]" />
        <div className="grid gap-4 md:grid-cols-4">
          <div className="h-32 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Creator Dashboard
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Redes Sociais</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                Consola integrada para métricas, crescimento, posts e agendamento estratégico do TempCast.
              </p>
            </div>
          </div>
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent("open-quick-modal", { detail: "social" }))}
            className="w-full sm:w-auto btn-brand"
          >
            <Send className="h-4 w-4" />
            Novo Post
          </Button>
        </div>
      </section>

      {/* Plataformas Filtro */}
      <section className="brand-card p-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs font-bold text-muted-foreground">
          <Filter className="h-4 w-4" />
          Plataforma
        </div>
        {platforms.map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => setActivePlatform(platform)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              platform === activePlatform
                ? "bg-primary text-primary-foreground font-bold shadow-md"
                : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border"
            }`}
          >
            {platform === "Combined" ? "Combinado" : platform}
          </button>
        ))}
      </section>

      {/* Grid de Métricas do Criador */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Visualizações */}
        <article className="brand-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Visualizações</span>
            <Eye className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight">{analyticsData.views}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
            <span className="flex items-center gap-1 text-emerald-500 font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
              {analyticsData.growth}
            </span>
            <span>este mês</span>
          </div>
        </article>

        {/* Seguidores / Subscritores */}
        <article className="brand-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase">{analyticsData.followersLabel}</span>
            <Users className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight">{analyticsData.followers}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
            <span className="text-primary font-bold">Meta: 50K</span>
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "85%" }} />
            </div>
          </div>
        </article>

        {/* Watch Time */}
        <article className="brand-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Tempo de Visualização</span>
            <Clock className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight">{analyticsData.watchTime}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
            <span>Engagement Rate</span>
            <span className="font-bold text-foreground">{analyticsData.engagement}</span>
          </div>
        </article>

        {/* Receita (SaaS Ready) */}
        <article className="brand-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Receita Estimada</span>
            <Coins className="h-4.5 w-4.5 text-primary" />
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-primary">{analyticsData.revenue}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
            <span>Pronto para monetização</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-1.5 py-0.5 rounded font-bold uppercase">SaaS</span>
          </div>
        </article>
      </section>

      {/* Gráfico Analítico de Crescimento */}
      <section className="brand-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Estatísticas do Canal</span>
            <h3 className="text-lg font-bold">Crescimento de Audiência</h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: analyticsData.chartColor }} />
            <span className="capitalize">{activePlatform === "Combined" ? "Todos os canais" : activePlatform}</span>
          </div>
        </div>
        <div className="mt-4 w-full">
          <MiniAreaChart data={analyticsData.chartData} color={analyticsData.chartColor} />
        </div>
      </section>

      {/* Grid de Publicações e Recomendações */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="brand-card p-6">
          <h3 className="text-lg font-bold mb-4">Fila de Publicação</h3>
          <div className="grid gap-3">
            {visiblePosts.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Sem posts agendados para esta plataforma.
              </div>
            ) : (
              visiblePosts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-border/70 bg-background/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 rounded px-2 py-0.5 uppercase">
                        {post.platform}
                      </span>
                      <p className="mt-2 text-sm text-muted-foreground font-medium leading-relaxed">{post.content}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                      {post.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground pt-3 border-t border-border/30">
                    <span className="rounded-full border border-border bg-background/80 px-2.5 py-0.5">{post.scheduledFor}</span>
                    <span className="rounded-full border border-border bg-background/80 px-2.5 py-0.5">Público: {post.audience}</span>
                    <span className="rounded-full border border-border bg-background/80 px-2.5 py-0.5">{post.performance}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-6">
          {/* Calendário Resumido */}
          <section className="brand-card p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <CalendarClock className="h-4.5 w-4.5 text-primary" />
              Calendário Editorial
            </h3>
            <div className="space-y-3 text-xs">
              {[
                { detail: "Reel no Instagram · Lançamento de Clipes", time: "Hoje, 19:00" },
                { detail: "Shorts no YouTube · Melhores momentos Sofia Vale", time: "Amanhã, 11:30" },
                { detail: "Publicação no LinkedIn · Post de Insights", time: "Sexta-feira, 14:00" },
              ].map((cal, idx) => (
                <div key={idx} className="rounded-xl border border-border/50 bg-background/60 p-3 flex justify-between items-center">
                  <span className="font-semibold text-muted-foreground">{cal.detail}</span>
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/10 rounded px-1.5 py-0.5 font-bold whitespace-nowrap">{cal.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recomendações Estratégicas */}
          <section className="brand-card p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              Recomendações de IA
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p className="leading-relaxed">
                💡 **Melhor Hora para Publicar**: De acordo com a atividade dos teus subscritores no YouTube, programa os Shorts para as **18:30 às quartas-feiras** para maximizar o alcance nas primeiras horas.
              </p>
              <p className="leading-relaxed">
                📈 **Estratégia de Shorts**: Transforma a resposta sobre "Inteligência Artificial" da Sofia Vale num corte vertical de 45 segundos. A taxa de retenção estimada para este tema é alta.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
