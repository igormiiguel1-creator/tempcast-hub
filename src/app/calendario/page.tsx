"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Sparkles, TimerReset, Video, Mic2, Ticket, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SummaryCard } from "@/features/production/components/summary-card";
import { calendarEvents } from "@/features/production/mock-data";
import type { CalendarEvent } from "@/features/production/types";

const views = ["Month", "Week", "Day", "Agenda"] as const;
type ViewMode = (typeof views)[number];

const eventTypes = ["All", "Recording", "Editing", "Publication", "Meeting", "Sponsor", "Reminder", "Task"] as const;

type EventTypeFilter = (typeof eventTypes)[number];

const kpis = [
  { title: "Upcoming events", value: "12", detail: "Next 7 days", icon: CalendarDays, accent: "bg-primary/10 text-primary" },
  { title: "Recordings", value: "4", detail: "In this sprint", icon: Mic2, accent: "bg-emerald-500/10 text-emerald-600" },
  { title: "Meetings", value: "3", detail: "Client & internal", icon: Video, accent: "bg-sky-500/10 text-sky-600" },
  { title: "Reminders", value: "5", detail: "Action needed", icon: BellRing, accent: "bg-amber-500/10 text-amber-600" },
];

export default function CalendarioPage() {
  const [view, setView] = useState<ViewMode>("Month");
  const [filter, setFilter] = useState<EventTypeFilter>("All");

  const visibleEvents = useMemo(() => {
    if (filter === "All") return calendarEvents;
    return calendarEvents.filter((event) => event.type === filter);
  }, [filter]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Production calendar
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Calendar</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">Coordinate recordings, edits, publishes, syncs, and reminders from one polished workspace.</p>
            </div>
          </div>
          <Button className="w-full sm:w-auto">
            <CalendarDays className="h-4 w-4" />
            New event
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <SummaryCard key={item.title} {...item} />
        ))}
      </section>

      <section className="brand-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Previous period">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium">July 2026</div>
            <Button variant="outline" size="icon" aria-label="Next period">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {views.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-all duration-200",
                  view === item ? "bg-primary text-primary-foreground" : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Event type
          </div>
          {eventTypes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition-all duration-200",
                filter === item ? "bg-foreground text-background" : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="brand-card p-4 sm:p-6">
          <div className="grid gap-3 md:grid-cols-7">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-7">
            {Array.from({ length: 14 }).map((_, index) => (
              <div key={index} className="min-h-28 rounded-[24px] border border-border/70 bg-background/70 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{index + 8}</p>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-primary">{view}</span>
                </div>
                {index === 9 ? <div className="mt-3 rounded-2xl bg-primary/10 p-2 text-xs text-primary">Recording • Episode #12</div> : null}
                {index === 12 ? <div className="mt-2 rounded-2xl bg-amber-500/10 p-2 text-xs text-amber-600">Editing • Episode #11</div> : null}
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="brand-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming events</p>
                <h3 className="text-lg font-semibold tracking-tight">Agenda widget</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <TimerReset className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {visibleEvents.map((event) => (
                <div key={event.id} className="rounded-[22px] border border-border/70 bg-background/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{event.summary}</p>
                    </div>
                    <div className={cn("rounded-full px-2.5 py-1 text-xs font-medium", event.accent)}>{event.type}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">{event.date}</span>
                    <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">{event.time}</span>
                    <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">{event.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="brand-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drag-ready layout</p>
                <h3 className="text-lg font-semibold tracking-tight">Future implementation</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Ticket className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">The calendar is structured to support drag-and-drop reordering, multi-day event blocks, and richer drag interactions as soon as the scheduling layer is wired.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
