import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SummaryCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
};

export function SummaryCard({ title, value, detail, icon: Icon, accent }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={cn("rounded-2xl p-3", accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{detail}</div>
    </article>
  );
}
