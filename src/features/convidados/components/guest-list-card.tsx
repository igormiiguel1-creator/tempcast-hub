import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Guest, GuestPriority } from "@/features/convidados/types";
import { cn } from "@/lib/utils";

const priorityTone: Record<GuestPriority, string> = {
  Low: "bg-emerald-500/10 text-emerald-600",
  Medium: "bg-amber-500/10 text-amber-600",
  High: "bg-sky-500/10 text-sky-600",
  Urgent: "bg-rose-500/10 text-rose-600",
};

type GuestListCardProps = {
  guest: Guest;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
};

export function GuestListCard({ guest, isSelected, onSelect, onToggleFavorite }: GuestListCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full rounded-[24px] border border-border/70 bg-background/70 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_45px_-28px_rgba(34,34,34,0.35)]",
        isSelected && "border-primary/30 bg-primary/5 shadow-[0_18px_45px_-28px_rgba(233,183,70,0.45)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {guest.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight">{guest.name}</p>
            <p className="truncate text-sm text-muted-foreground">{guest.profession}</p>
            <p className="truncate text-sm text-muted-foreground">{guest.company}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={guest.favorite ? "Remover favorito" : "Marcar favorito"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Heart className={cn("h-4 w-4", guest.favorite && "fill-primary text-primary")} />
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <Star className="h-3.5 w-3.5" />
          {guest.status}
        </span>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", priorityTone[guest.priority])}>
          {guest.priority}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Recording</p>
          <p className="mt-1 font-medium text-foreground">{guest.recordingDate}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground/80">Publication</p>
          <p className="mt-1 font-medium text-foreground">{guest.publicationDate}</p>
        </div>
      </div>
    </button>
  );
}
