import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  Clock,
  EyeOff,
  MessageSquare,
  Quote,
  Send,
  Trash2,
  Type,
  Users,
} from "lucide-react";
import type { ConversationAnalysis, ParticipantStats } from "../types";

type AnalysisReportProps = {
  analysis: ConversationAnalysis;
  selfName: string | null;
};

const QUOTE_LIMIT = 280;

export function AnalysisReport({ analysis, selfName }: AnalysisReportProps) {
  const { participants } = analysis;
  const label = (name: string) => (name === selfName ? `${name} (tu)` : name);
  const fastest = findFastestResponder(participants);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card title="Resumo" icon={MessageSquare} className="md:col-span-2 xl:col-span-3">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Mensagens" value={analysis.totalMessages.toLocaleString("pt-PT")} />
          <Stat label="Primeira mensagem" value={formatDate(analysis.firstMessageAt)} />
          <Stat label="Última mensagem" value={formatDate(analysis.lastMessageAt)} />
          <Stat
            label="Dias com mensagens"
            value={`${analysis.activeDays} de ${analysis.spanDays}`}
          />
        </dl>
      </Card>

      <Card title="Quem escreve mais" icon={Users}>
        <ul className="space-y-4">
          {participants.map((person) => (
            <li key={person.name} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium">{label(person.name)}</span>
                <span className="shrink-0 text-muted-foreground">
                  {person.messageCount.toLocaleString("pt-PT")} · {formatPercent(person.messageShare)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(person.messageShare * 100, 1)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Tempo de resposta" icon={Clock}>
        <ul className="space-y-3">
          {participants.map((person) => (
            <li key={person.name} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{label(person.name)}</span>
              <span className="shrink-0 text-right">
                {person.medianResponseMinutes === null ? (
                  <span className="text-muted-foreground">Sem respostas</span>
                ) : (
                  <>
                    <span className="font-semibold">{formatDuration(person.medianResponseMinutes)}</span>
                    <span className="block text-xs text-muted-foreground">
                      média {formatDuration(person.averageResponseMinutes ?? 0)}
                    </span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Mediana: metade das respostas é mais rápida do que este valor. Só contam respostas até 12 h.
          {fastest && participants.length > 1 && (
            <>
              {" "}
              Responde mais depressa: <strong className="text-foreground">{label(fastest)}</strong>.
            </>
          )}
        </p>
      </Card>

      <Card title="Quem inicia conversas" icon={Send}>
        <ul className="space-y-3">
          {participants.map((person) => (
            <li key={person.name} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{label(person.name)}</span>
              <span className="shrink-0 font-semibold">
                {person.conversationStarts}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  de {analysis.totalConversationStarts}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Uma conversa começa depois de pelo menos 6 h sem mensagens.
        </p>
      </Card>

      {analysis.isDirect && (
        <Card title="Sem resposta em 24 h" icon={EyeOff}>
          <ul className="space-y-3">
            {participants.map((person) => (
              <li key={person.name} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{label(person.name)}</span>
                <span className="shrink-0 font-semibold">{person.unansweredCount ?? 0}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Vezes em que a pessoa não respondeu no prazo de 24 h às mensagens da outra.
          </p>
        </Card>
      )}

      <Card title="Mensagens apagadas" icon={Trash2}>
        <ul className="space-y-3">
          {participants.map((person) => (
            <li key={person.name} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{label(person.name)}</span>
              <span className="shrink-0 font-semibold">{person.deletedCount}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Comprimento médio" icon={AlignLeft}>
        <ul className="space-y-3">
          {participants.map((person) => (
            <li key={person.name} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{label(person.name)}</span>
              <span className="shrink-0 font-semibold">
                {person.averageWordsPerMessage.toFixed(1).replace(".", ",")}
                <span className="font-normal text-muted-foreground"> palavras</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Mensagem mais longa" icon={Quote} className="md:col-span-2 xl:col-span-3">
        <div className="grid gap-4 md:grid-cols-2">
          {participants.map((person) => (
            <LongestMessageBlock key={person.name} name={label(person.name)} person={person} />
          ))}
        </div>
      </Card>

      <Card title="Palavras mais usadas" icon={Type} className="md:col-span-2 xl:col-span-3">
        <div className="grid gap-6 md:grid-cols-2">
          {participants.map((person) => (
            <div key={person.name} className="space-y-3">
              <p className="text-sm font-medium">{label(person.name)}</p>
              {person.topWords.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem palavras suficientes para analisar.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {person.topWords.map((entry) => (
                    <li
                      key={entry.word}
                      className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs"
                    >
                      <span className="font-semibold">{entry.word}</span>
                      <span className="ml-1.5 text-muted-foreground">{entry.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  className = "",
  children,
}: {
  title: string;
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`brand-card p-5 ${className}`}>
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}

function LongestMessageBlock({ name, person }: { name: string; person: ParticipantStats }) {
  const longest = person.longestMessage;
  if (!longest) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">Sem mensagens de texto.</p>
      </div>
    );
  }

  const quote =
    longest.text.length > QUOTE_LIMIT ? `${longest.text.slice(0, QUOTE_LIMIT).trimEnd()}…` : longest.text;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {name}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {longest.words} palavras · {formatDate(longest.timestamp)}
        </span>
      </p>
      <blockquote className="whitespace-pre-line rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed">
        {quote}
      </blockquote>
    </div>
  );
}

function findFastestResponder(participants: ParticipantStats[]): string | null {
  let fastest: ParticipantStats | null = null;
  for (const person of participants) {
    if (person.medianResponseMinutes === null) continue;
    if (!fastest || person.medianResponseMinutes < (fastest.medianResponseMinutes ?? Infinity)) {
      fastest = person;
    }
  }
  return fastest?.name ?? null;
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return "menos de 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const totalHours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (totalHours < 24) {
    return remainingMinutes > 0 ? `${totalHours} h ${remainingMinutes} min` : `${totalHours} h`;
  }

  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  return remainingHours > 0 ? `${days} d ${remainingHours} h` : `${days} d`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

function formatPercent(share: number): string {
  return `${Math.round(share * 100)}%`;
}
