import { type LucideIcon } from "lucide-react";

type DetailSectionCardProps = {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

export function DetailSectionCard({ title, icon: Icon, children }: DetailSectionCardProps) {
  return (
    <section className="rounded-3xl border border-border/70 bg-background/70 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
