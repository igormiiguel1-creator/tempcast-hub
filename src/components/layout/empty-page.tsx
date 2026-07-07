import { Sparkles } from "lucide-react";

type EmptyPageProps = {
  title: string;
};

export function EmptyPage({ title }: EmptyPageProps) {
  return (
    <section className="min-h-[calc(100vh-5rem)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="brand-panel flex min-h-[22rem] items-center justify-center p-8 text-center sm:p-10">
        <div className="max-w-xl space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              This module is being shaped into a premium workspace for the next TempCast milestone.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
