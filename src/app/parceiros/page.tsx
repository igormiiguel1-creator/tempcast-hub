"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, CalendarClock, FileText, Handshake, Sparkles, Wallet } from "lucide-react";
import { SummaryCard } from "@/features/production/components/summary-card";
import { partners } from "@/features/production/mock-data";
import type { Partner } from "@/features/production/types";

export default function ParceirosPage() {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(partners[0]);

  const activePartners = useMemo(() => partners.filter((partner) => partner.status === "Active"), []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Partner workspace
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Partners</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">Keep sponsors, partners, contracts, meetings and renewals in a single premium view.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Active sponsors" value="3" detail="Current collaborations" icon={Handshake} accent="bg-primary/10 text-primary" />
        <SummaryCard title="Renewals" value="2" detail="Upcoming this month" icon={CalendarClock} accent="bg-emerald-500/10 text-emerald-600" />
        <SummaryCard title="Meetings" value="4" detail="Scheduled syncs" icon={BriefcaseBusiness} accent="bg-sky-500/10 text-sky-600" />
        <SummaryCard title="Invoice value" value="€9.7k" detail="Open pipeline" icon={Wallet} accent="bg-amber-500/10 text-amber-600" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="brand-card p-4 sm:p-6">
          <div className="grid gap-3">
            {partners.map((partner) => (
              <button
                key={partner.id}
                type="button"
                onClick={() => setSelectedPartner(partner)}
                className={partner.id === selectedPartner?.id ? "rounded-[24px] border border-primary/30 bg-primary/5 p-4 text-left" : "rounded-[24px] border border-border/70 bg-background/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background"}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{partner.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{partner.type} · {partner.status}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{partner.contractValue}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">Next meeting: {partner.nextMeeting}</span>
                  <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1">Renewal: {partner.renewalDate}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          {selectedPartner ? (
            <>
              <section className="brand-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Partner profile</p>
                    <h3 className="text-xl font-semibold tracking-tight">{selectedPartner.name}</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Handshake className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{selectedPartner.notes}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Contact</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selectedPartner.contact}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Contract value</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selectedPartner.contractValue}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Next meeting</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selectedPartner.nextMeeting}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Renewal</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{selectedPartner.renewalDate}</p>
                  </div>
                </div>
              </section>

              <section className="brand-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <FileText className="h-4 w-4 text-primary" />
                  Contracts & invoices
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="rounded-[20px] border border-border/70 bg-background/70 p-3">Active contract · ready for signature</div>
                  <div className="rounded-[20px] border border-border/70 bg-background/70 p-3">Invoice pending · due next week</div>
                </div>
              </section>

              <section className="brand-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Active partnership health
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{activePartners.length} active partners are currently aligned with the next content sprint and revenue target.</p>
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
