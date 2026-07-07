"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CirclePlus,
  Clock3,
  Copy,
  FileText,
  Filter,
  Globe2,
  Link2,
  ListChecks,
  Mail,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Video,
  Radio,
  CalendarClock,
  Wallet,
  Heart,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { guests as guestSeedData } from "@/features/convidados/mock-data";
import { DetailSectionCard } from "@/features/convidados/components/detail-section-card";
import { GuestListCard } from "@/features/convidados/components/guest-list-card";
import { GuestSummaryCard } from "@/features/convidados/components/guest-summary-card";
import type { Guest, GuestPriority, GuestStatus } from "@/features/convidados/types";

const statusFilters: Array<{ label: string; value: GuestStatus | "Todos" }> = [
  { label: "Todos", value: "Todos" },
  { label: "Idea", value: "Idea" },
  { label: "Contacted", value: "Contacted" },
  { label: "Negotiating", value: "Negotiating" },
  { label: "Confirmed", value: "Confirmed" },
  { label: "Recorded", value: "Recorded" },
  { label: "Published", value: "Published" },
  { label: "Cancelled", value: "Cancelled" },
];

const priorityFilters: Array<{ label: string; value: GuestPriority | "Todos" }> = [
  { label: "Todos", value: "Todos" },
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
  { label: "Urgent", value: "Urgent" },
];

const kpis = [
  { title: "Total Guests", value: "128", detail: "+8 este mês", icon: Building2, accent: "bg-primary/10 text-primary" },
  { title: "Confirmed Guests", value: "34", detail: "Prontos para gravar", icon: CheckCircle2, accent: "bg-emerald-500/10 text-emerald-600" },
  { title: "Pending Replies", value: "12", detail: "Aguardando resposta", icon: Mail, accent: "bg-sky-500/10 text-sky-600" },
  { title: "Published Episodes", value: "18", detail: "Já no catálogo", icon: Video, accent: "bg-amber-500/10 text-amber-600" },
  { title: "Upcoming Recordings", value: "5", detail: "Na próxima semana", icon: CalendarClock, accent: "bg-violet-500/10 text-violet-600" },
];

export default function ConvidadosPage() {
  const [activeStatusFilter, setActiveStatusFilter] = useState<GuestStatus | "Todos">("Todos");
  const [activePriorityFilter, setActivePriorityFilter] = useState<GuestPriority | "Todos">("Todos");
  const [query, setQuery] = useState("");
  const [guests, setGuests] = useState<Guest[]>(guestSeedData);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(guestSeedData[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredGuests = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return guests.filter((guest) => {
      const matchesStatus = activeStatusFilter === "Todos" || guest.status === activeStatusFilter;
      const matchesPriority = activePriorityFilter === "Todos" || guest.priority === activePriorityFilter;
      const matchesQuery =
        guest.name.toLowerCase().includes(normalizedQuery) ||
        guest.company.toLowerCase().includes(normalizedQuery) ||
        guest.profession.toLowerCase().includes(normalizedQuery) ||
        guest.status.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesPriority && matchesQuery;
    });
  }, [activePriorityFilter, activeStatusFilter, guests, query]);

  useEffect(() => {
    if (!filteredGuests.some((guest) => guest.id === selectedGuest?.id)) {
      setSelectedGuest(filteredGuests[0] ?? null);
    }
  }, [filteredGuests, selectedGuest]);

  const toggleFavorite = (guestId: number) => {
    setGuests((currentGuests) =>
      currentGuests.map((guest) => (guest.id === guestId ? { ...guest, favorite: !guest.favorite } : guest)),
    );
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Guests workspace
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Convidados</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                Centralize relações, disponibilidade, custos e próximos passos num painel premium de produção.
              </p>
            </div>
          </div>
          <Button className="w-full sm:w-auto">
            <CirclePlus className="h-4 w-4" />
            New Guest
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => (
          <GuestSummaryCard key={item.title} {...item} />
        ))}
      </section>

      <section className="brand-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, company, role or status"
              className="h-11 w-full rounded-full border border-border/70 bg-background/80 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveStatusFilter(filter.value)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-all duration-200",
                  activeStatusFilter === filter.value
                    ? "bg-primary text-primary-foreground shadow-[0_10px_30px_-18px_rgba(233,183,70,0.85)]"
                    : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
          {priorityFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActivePriorityFilter(filter.value)}
              className={cn(
                "rounded-full px-3 py-2 text-sm transition-all duration-200",
                activePriorityFilter === filter.value
                  ? "bg-foreground text-background"
                  : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="brand-card overflow-hidden">
          <div className="border-b border-border/70 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Guest roster</p>
                <h3 className="text-lg font-semibold tracking-tight">Relationship pipeline</h3>
              </div>
              <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-sm text-muted-foreground">
                {filteredGuests.length} results
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-4 sm:p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-3xl border border-border/60 bg-background/70 p-4">
                  <div className="mb-3 h-10 w-10 rounded-full bg-muted" />
                  <div className="h-4 w-1/3 rounded-full bg-muted" />
                  <div className="mt-2 h-3 w-2/3 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <ListChecks className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">No guests found</h4>
                <p className="mt-1 text-sm text-muted-foreground">Adjust the filters or search for another contact.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 p-4 sm:p-6">
              {filteredGuests.map((guest) => (
                <GuestListCard
                  key={guest.id}
                  guest={guest}
                  isSelected={selectedGuest?.id === guest.id}
                  onSelect={() => setSelectedGuest(guest)}
                  onToggleFavorite={() => toggleFavorite(guest.id)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="brand-card p-5">
          {selectedGuest ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {selectedGuest.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Selected guest</p>
                    <h3 className="truncate text-xl font-semibold tracking-tight">{selectedGuest.name}</h3>
                  </div>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedGuest.company}</p>
                    <p className="text-sm text-muted-foreground">{selectedGuest.profession}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{selectedGuest.priority}</div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{selectedGuest.biography}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-border/70 bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Email</p>
                  <p className="mt-1 text-sm font-medium">{selectedGuest.email}</p>
                </div>
                <div className="rounded-[20px] border border-border/70 bg-background/70 p-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Phone</p>
                  <p className="mt-1 text-sm font-medium">{selectedGuest.phone}</p>
                </div>
              </div>

              <DetailSectionCard title="Basic Information" icon={NotebookPen}>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Name</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Profession</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.profession}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Company</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.company}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Biography</p>
                    <p className="mt-1 text-sm">{selectedGuest.biography}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Notes</p>
                    <p className="mt-1 text-sm">{selectedGuest.notes}</p>
                  </div>
                </div>
              </DetailSectionCard>

              <DetailSectionCard title="Contacts" icon={Mail}>
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div className="rounded-[18px] border border-border/70 bg-background/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Email</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.email}</p>
                  </div>
                  <div className="rounded-[18px] border border-border/70 bg-background/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Phone</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.phone}</p>
                  </div>
                  <div className="rounded-[18px] border border-border/70 bg-background/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Instagram</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.instagram}</p>
                  </div>
                  <div className="rounded-[18px] border border-border/70 bg-background/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">LinkedIn</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.linkedin}</p>
                  </div>
                  <div className="rounded-[18px] border border-border/70 bg-background/60 p-3 sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Website</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.website}</p>
                  </div>
                </div>
              </DetailSectionCard>

              <DetailSectionCard title="Production" icon={CalendarClock}>
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Contact date</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.contactDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Confirmation date</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.confirmationDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Recording date</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.recordingDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Editing date</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.editingDate}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Publication date</p>
                    <p className="mt-1 font-medium text-foreground">{selectedGuest.publicationDate}</p>
                  </div>
                </div>
              </DetailSectionCard>

              <DetailSectionCard title="Expenses" icon={Wallet}>
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  {Object.entries(selectedGuest.expenses).map(([key, value]) => (
                    <div key={key} className="rounded-[18px] border border-border/70 bg-background/60 p-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">{key}</p>
                      <p className="mt-1 font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </DetailSectionCard>

              <DetailSectionCard title="Checklist" icon={CheckCircle2}>
                <div className="space-y-2">
                  {selectedGuest.checklist.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/60 px-3 py-2 text-sm">
                      <span className="text-foreground">{item.label}</span>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", item.checked ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>{item.checked ? "Done" : "Pending"}</span>
                    </div>
                  ))}
                </div>
              </DetailSectionCard>

              <DetailSectionCard title="Attachments" icon={FileText}>
                <div className="space-y-2">
                  {selectedGuest.attachments.map((item) => (
                    <div key={item} className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </DetailSectionCard>

              <DetailSectionCard title="Timeline" icon={Clock3}>
                <div className="space-y-2">
                  {selectedGuest.timeline.map((step) => (
                    <div key={step.label} className="rounded-2xl border border-border/70 bg-background/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{step.label}</p>
                        <p className="text-sm text-muted-foreground">{step.date}</p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{step.note}</p>
                    </div>
                  ))}
                </div>
              </DetailSectionCard>

              <DetailSectionCard title="Recent activity" icon={TrendingUp}>
                <div className="space-y-2">
                  {selectedGuest.recentActivity.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-border/70 bg-background/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </DetailSectionCard>

              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full">
                  <CheckCircle2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button variant="outline" className="rounded-full">
                  <MessageSquareText className="h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Send className="h-4 w-4" />
                  LinkedIn
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-center text-sm text-muted-foreground">
              Select a guest to inspect the full workspace view.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
