"use client";

import { useMemo, useState } from "react";
import {
  FileDown,
  Presentation,
  Sparkles,
  TrendingUp,
  Wallet,
  Calendar,
  Filter,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-state";

const dateFilters = ["Últimos 7 dias", "Este mês", "Último trimestre", "Este ano"] as const;
const platformFilters = ["Todas", "YouTube", "Spotify", "Meta", "TikTok"] as const;

// Helper para gráfico de barras simples em SVG
function BarChartBreakdown({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  const height = 160;

  return (
    <div className="w-full flex items-end justify-between h-40 pt-4 px-2">
      {data.map((item, idx) => {
        const barHeight = max > 0 ? (item.value / max) * (height - 30) : 0;
        return (
          <div key={idx} className="flex flex-col items-center flex-1 group">
            <span className="text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-1">
              {item.value.toLocaleString()}
            </span>
            <div
              className="w-10 rounded-t-lg transition-all duration-300 hover:brightness-110"
              style={{
                height: `${barHeight}px`,
                backgroundColor: item.color,
              }}
            />
            <span className="text-[10px] text-muted-foreground font-semibold mt-2 truncate w-16 text-center">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function RelatoriosPage() {
  const { reports, financeEntries, episodes, generatePreview } = useAppData();
  const [activeDate, setActiveDate] = useState<(typeof dateFilters)[number]>("Este mês");
  const [activePlatform, setActivePlatform] = useState<(typeof platformFilters)[number]>("Todas");
  const [loadingExport, setLoadingExport] = useState<string | null>(null);

  // Filtrar os relatórios com base nas seleções da UI
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Filtrar por plataforma
      if (activePlatform !== "Todas") {
        const pLower = activePlatform.toLowerCase();
        const rTitle = report.title.toLowerCase();
        const rSum = report.summary.toLowerCase();
        if (!rTitle.includes(pLower) && !rSum.includes(pLower)) {
          return false;
        }
      }
      return true;
    });
  }, [reports, activePlatform]);

  // Totais financeiros baseados no filtro de data
  const financeStats = useMemo(() => {
    let income = 0;
    let expenses = 0;

    financeEntries.forEach((entry) => {
      const amount = parseFloat(entry.amount.replace("€", "").replace(",", "").trim()) || 0;
      if (entry.type === "Income") {
        income += amount;
      } else {
        expenses += amount;
      }
    });

    // Ajustar valores com base no filtro de data para simular dinamismo real
    const factor = activeDate === "Últimos 7 dias" ? 0.25 : activeDate === "Último trimestre" ? 3 : activeDate === "Este ano" ? 12 : 1;
    const finalIncome = income * factor;
    const finalExpenses = expenses * factor;
    const balance = finalIncome - finalExpenses;

    return {
      income: `€${finalIncome.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      expenses: `€${finalExpenses.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      balance: `€${balance.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      isPositive: balance >= 0,
    };
  }, [financeEntries, activeDate]);

  // Gráfico de distribuição de visualizações por plataforma
  const chartData = useMemo(() => {
    const factor = activeDate === "Últimos 7 dias" ? 1 : activeDate === "Último trimestre" ? 3.5 : activeDate === "Este ano" ? 11 : 1.2;
    return [
      { label: "YouTube", value: Math.round(184000 * factor), color: "#ff6b5b" },
      { label: "Spotify", value: Math.round(85000 * factor), color: "#1db954" },
      { label: "TikTok", value: Math.round(112000 * factor), color: "#22c55e" },
      { label: "Instagram", value: Math.round(145000 * factor), color: "#ec4899" },
      { label: "Facebook", value: Math.round(24000 * factor), color: "#3b82f6" },
    ];
  }, [activeDate]);

  // Ação de exportação
  const handleExport = (format: "PDF" | "Excel", title: string) => {
    const key = `${format}-${title}`;
    setLoadingExport(key);

    setTimeout(() => {
      setLoadingExport(null);
      // Chamar a função real para preview e notificar via toast
      generatePreview(format);
      
      const event = new CustomEvent("open-quick-modal", { detail: null });
      window.dispatchEvent(event);

      // Disparar uma notificação de sucesso
      alert(`O relatório "${title}" foi exportado com sucesso em formato ${format}!`);
    }, 1500);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Central de Relatórios
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Relatórios</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                Gera relatórios analíticos, financeiros e de crescimento prontos para partilhar com sponsors e parceiros.
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleExport("PDF", "Resumo Executivo")}
            className="w-full sm:w-auto btn-brand"
          >
            <FileDown className="h-4 w-4" />
            Exportar Todos
          </Button>
        </div>
      </section>

      {/* Barra de Filtros Interativos */}
      <section className="brand-card p-5 grid gap-4 md:grid-cols-2 items-center">
        {/* Filtro de Data */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Período:
          </span>
          {dateFilters.map((df) => (
            <button
              key={df}
              type="button"
              onClick={() => setActiveDate(df)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                df === activeDate
                  ? "bg-primary text-primary-foreground font-bold shadow-md"
                  : "bg-background/80 text-muted-foreground hover:bg-accent border border-border"
              }`}
            >
              {df}
            </button>
          ))}
        </div>

        {/* Filtro de Plataforma */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Canais:
          </span>
          {platformFilters.map((pf) => (
            <button
              key={pf}
              type="button"
              onClick={() => setActivePlatform(pf)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                pf === activePlatform
                  ? "bg-primary text-primary-foreground font-bold shadow-md"
                  : "bg-background/80 text-muted-foreground hover:bg-accent border border-border"
              }`}
            >
              {pf}
            </button>
          ))}
        </div>
      </section>

      {/* KPIs Financeiros e Performance */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Receita Operacional */}
        <article className="brand-card p-5">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Receitas</span>
          <h3 className="text-2xl font-bold mt-2 text-primary">{financeStats.income}</h3>
          <p className="text-[11px] text-muted-foreground mt-2">Simulação baseada em Sponsors</p>
        </article>

        {/* Despesas Operacionais */}
        <article className="brand-card p-5">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Despesas</span>
          <h3 className="text-2xl font-bold mt-2 text-red-500">{financeStats.expenses}</h3>
          <p className="text-[11px] text-muted-foreground mt-2">Catering, deslocações e cachets</p>
        </article>

        {/* Balanço Geral */}
        <article className="brand-card p-5">
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Saldo Líquido</span>
          <h3 className={`text-2xl font-bold mt-2 ${financeStats.isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {financeStats.balance}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-2">Balanço geral da operação</p>
        </article>

        {/* Crescimento de Audiência */}
        <article className="brand-card p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Crescimento</span>
            <div className="flex items-center gap-1.5 mt-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <h3 className="text-2xl font-bold text-foreground">+12.4%</h3>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase w-fit self-end mt-2">
            Em Alta
          </span>
        </article>
      </section>

      {/* Gráfico de Distribuição */}
      <section className="brand-card p-6">
        <h3 className="text-lg font-bold mb-4">Audiência por Canal</h3>
        <p className="text-xs text-muted-foreground mb-4">Distribuição de impressões e visualizações estimadas.</p>
        <BarChartBreakdown data={chartData} />
      </section>

      {/* Lista de Relatórios com Ações de Exportação */}
      <section className="grid gap-4 xl:grid-cols-3">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center py-10 text-sm text-muted-foreground">
            Nenhum relatório encontrado para as configurações selecionadas.
          </div>
        ) : (
          filteredReports.map((report) => (
            <article key={report.id} className="brand-card p-5 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-foreground">{report.title}</h4>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    {report.format}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{report.summary}</p>
              </div>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">{report.category}</span>
                <span className="font-bold text-emerald-500">{report.trend}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-bold"
                  disabled={loadingExport !== null}
                  onClick={() => handleExport("PDF", report.title)}
                >
                  {loadingExport === `PDF-${report.title}` ? "A exportar..." : "Descarregar PDF"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-bold"
                  disabled={loadingExport !== null}
                  onClick={() => handleExport("Excel", report.title)}
                >
                  {loadingExport === `Excel-${report.title}` ? "A exportar..." : "Descarregar Excel"}
                </Button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
