"use client";

import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Filter, Sparkles, Ticket, Users, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SummaryCard } from "@/features/production/components/summary-card";
import { roadmapCards } from "@/features/production/mock-data";
import type { EpisodePriority, RoadmapStage, RoadmapCard } from "@/features/production/types";

const columns: RoadmapStage[] = ["Ideas", "Contacted", "Confirmed", "Recording", "Editing", "Scheduled", "Published", "Archived"];
const priorityFilters: Array<{ label: string; value: EpisodePriority | "Todos" }> = [
  { label: "Todos", value: "Todos" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const kpis = [
  { title: "Ideas", value: "12", detail: "In discovery", icon: Wand2, accent: "bg-primary/10 text-primary" },
  { title: "Confirmed", value: "8", detail: "Ready for production", icon: CheckCircle2, accent: "bg-emerald-500/10 text-emerald-600" },
  { title: "Scheduled", value: "6", detail: "Locked in the calendar", icon: CalendarClock, accent: "bg-sky-500/10 text-sky-600" },
  { title: "Published", value: "4", detail: "Already launched", icon: Ticket, accent: "bg-amber-500/10 text-amber-600" },
];

export default function RoadmapPage() {
  const [activePriorityFilter, setActivePriorityFilter] = useState<EpisodePriority | "Todos">("Todos");

  const filteredCards = useMemo(() => {
    if (activePriorityFilter === "Todos") return roadmapCards;
    return roadmapCards.filter((card) => card.priority === activePriorityFilter);
  }, [activePriorityFilter]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Production roadmap
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Roadmap</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">Track editorial opportunities and milestones across the entire production lifecycle.</p>
            </div>
          </div>
          <Button className="w-full sm:w-auto">
            <Ticket className="h-4 w-4" />
            New card
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <SummaryCard key={item.title} {...item} />
        ))}
      </section>

      <section className="brand-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Priority
          </div>
          {priorityFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActivePriorityFilter(filter.value)}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition-all duration-200",
                activePriorityFilter === filter.value ? "bg-foreground text-background" : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => {
          const cards = filteredCards.filter((card) => card.stage === column);
          return (
            <div key={column} className="brand-card p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold tracking-tight">{column}</h3>
                <div className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">{cards.length}</div>
              </div>
              <div className="space-y-3">
                {cards.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-border/70 bg-background/60 p-4 text-center text-sm text-muted-foreground">No items in this lane.</div>
                ) : (
                  cards.map((card) => (
                    <article key={card.id} className="rounded-[22px] border border-border/70 bg-background/70 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{card.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{card.guest} · {card.episode}</p>
                        </div>
                        <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{card.priority}</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {card.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Due</span>
                          <span className="font-medium text-foreground">{card.dueDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Progress</span>
                          <span className="font-medium text-foreground">{card.progress}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-primary" style={{ width: `${card.progress}%` }} />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Users className="h-4 w-4" />
                          <span>{card.checklistPreview.join(" · ")}</span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
