"use client";

import { useMemo, useState } from "react";
import { Archive, BellRing, CheckCircle2, CircleDashed, FileText, Filter, Sparkles, UserRound, CalendarClock, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SummaryCard } from "@/features/production/components/summary-card";
import { tasks } from "@/features/production/mock-data";
import type { TaskItem, TaskSection, EpisodePriority } from "@/features/production/types";

const sections: TaskSection[] = ["My Tasks", "Today", "This Week", "Completed", "Overdue"];
const priorityFilters: Array<{ label: string; value: EpisodePriority | "Todos" }> = [
  { label: "Todos", value: "Todos" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const kpis = [
  { title: "My tasks", value: "9", detail: "Tracked this sprint", icon: CheckCircle2, accent: "bg-primary/10 text-primary" },
  { title: "Today", value: "3", detail: "Due today", icon: CalendarClock, accent: "bg-emerald-500/10 text-emerald-600" },
  { title: "This week", value: "5", detail: "Scheduled", icon: BellRing, accent: "bg-sky-500/10 text-sky-600" },
  { title: "Overdue", value: "1", detail: "Needs action", icon: Archive, accent: "bg-amber-500/10 text-amber-600" },
];

export default function TarefasPage() {
  const [activeSection, setActiveSection] = useState<TaskSection>("My Tasks");
  const [activePriorityFilter, setActivePriorityFilter] = useState<EpisodePriority | "Todos">("Todos");
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(tasks[0]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSection = task.section === activeSection || activeSection === "My Tasks";
      const matchesPriority = activePriorityFilter === "Todos" || task.priority === activePriorityFilter;
      return matchesSection && matchesPriority;
    });
  }, [activePriorityFilter, activeSection]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Production tasks
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tasks</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">Coordinate follow-ups, production blockers, and day-to-day production work with clarity.</p>
            </div>
          </div>
          <Button className="w-full sm:w-auto">
            <CircleDashed className="h-4 w-4" />
            New task
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
          {sections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition-all duration-200",
                activeSection === section ? "bg-primary text-primary-foreground" : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {section}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="brand-card p-4 sm:p-6">
          <div className="grid gap-3">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTask(task)}
                className={cn(
                  "rounded-3xl border border-border/70 bg-background/70 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background",
                  selectedTask?.id === task.id && "border-primary/30 bg-primary/5",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{task.priority}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">Assignee: {task.assignee}</span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">Due: {task.dueDate}</span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">Episode: {task.episode}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          {selectedTask ? (
            <>
              <section className="brand-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Task detail</p>
                    <h3 className="text-xl font-semibold tracking-tight">{selectedTask.title}</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{selectedTask.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Priority</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selectedTask.priority}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Assignee</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selectedTask.assignee}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Due date</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selectedTask.dueDate}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Episode</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selectedTask.episode}</p>
                  </div>
                </div>
              </section>

              <section className="brand-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Checklist
                </div>
                <div className="mt-4 space-y-2">
                  {selectedTask.checklist.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-3 py-2 text-sm">
                      <span className="text-foreground">{item.label}</span>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", item.checked ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>{item.checked ? "Done" : "Pending"}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="brand-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  Comments
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Comments placeholder for future collaboration and team discussion.</p>
              </section>

              <section className="brand-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <Archive className="h-4 w-4 text-primary" />
                  Attachments
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Attachments placeholder ready for file uploads and shared assets.</p>
              </section>

              <section className="brand-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <UserRound className="h-4 w-4 text-primary" />
                  Activity
                </div>
                <div className="mt-4 space-y-2">
                  {selectedTask.activity.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-border/70 bg-background/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="brand-card flex min-h-80 items-center justify-center p-5 text-center text-sm text-muted-foreground">Select a task to inspect the full detail workspace.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
