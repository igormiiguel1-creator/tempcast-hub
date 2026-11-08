import {
  CONVERSATION_GAP_HOURS,
  MAX_RESPONSE_HOURS,
  MIN_MESSAGES,
  TOP_WORDS_LIMIT,
  UNANSWERED_WINDOW_HOURS,
  STOPWORDS,
} from "../constants";
import type {
  AnalysisError,
  ChatMessage,
  ConversationAnalysis,
  LongestMessage,
  ParticipantStats,
  WordCount,
} from "../types";
import { stripMarkers, tokenise } from "./whatsapp-parser.service";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Sequência de mensagens consecutivas da mesma pessoa. */
type Run = {
  sender: string;
  start: Date;
  end: Date;
};

/** Devolve o motivo pelo qual a conversa não pode ser analisada, ou null se puder. */
export function getAnalysisError(messages: ChatMessage[]): AnalysisError | null {
  if (messages.length === 0) return "unrecognised-format";
  if (messages.length < MIN_MESSAGES) return "too-few-messages";

  const senders = new Set(messages.map((message) => message.sender));
  return senders.size < 2 ? "single-participant" : null;
}

/** Calcula as métricas factuais de uma conversa. Assume que `getAnalysisError` devolveu null. */
export function analyseConversation(input: ChatMessage[]): ConversationAnalysis {
  const messages = [...input].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const names = [...new Set(messages.map((message) => message.sender))];
  const runs = buildRuns(messages);
  const responsesByName = collectResponseMinutes(runs);
  const startsByName = countConversationStarts(messages);
  const unansweredByName = names.length === 2 ? countUnanswered(runs, names, messages) : null;

  const total = messages.length;
  const participants = names
    .map((name): ParticipantStats => {
      const own = messages.filter((message) => message.sender === name);
      const texts = own.filter((message) => message.kind === "text");
      const responses = responsesByName.get(name) ?? [];
      const totalWords = texts.reduce((sum, message) => sum + countWords(message.text), 0);

      return {
        name,
        messageCount: own.length,
        messageShare: own.length / total,
        averageWordsPerMessage: texts.length > 0 ? totalWords / texts.length : 0,
        deletedCount: own.filter((message) => message.kind === "deleted").length,
        responseCount: responses.length,
        averageResponseMinutes: responses.length > 0 ? mean(responses) : null,
        medianResponseMinutes: responses.length > 0 ? median(responses) : null,
        conversationStarts: startsByName.get(name) ?? 0,
        unansweredCount: unansweredByName ? (unansweredByName.get(name) ?? 0) : null,
        longestMessage: findLongestMessage(texts),
        topWords: findTopWords(texts),
      };
    })
    .sort((a, b) => b.messageCount - a.messageCount);

  const firstMessageAt = messages[0].timestamp;
  const lastMessageAt = messages[total - 1].timestamp;

  return {
    totalMessages: total,
    firstMessageAt,
    lastMessageAt,
    activeDays: countDistinctDays(messages),
    spanDays: countCalendarDays(firstMessageAt, lastMessageAt),
    totalConversationStarts: [...startsByName.values()].reduce((sum, count) => sum + count, 0),
    isDirect: names.length === 2,
    participants,
  };
}

function buildRuns(messages: ChatMessage[]): Run[] {
  const runs: Run[] = [];
  for (const message of messages) {
    const current = runs[runs.length - 1];
    if (current && current.sender === message.sender) {
      current.end = message.timestamp;
    } else {
      runs.push({ sender: message.sender, start: message.timestamp, end: message.timestamp });
    }
  }
  return runs;
}

/**
 * Tempo de resposta: entre a última mensagem de uma pessoa e a primeira da seguinte.
 * Pausas acima de MAX_RESPONSE_HOURS são descartadas para não distorcer a média.
 */
function collectResponseMinutes(runs: Run[]): Map<string, number[]> {
  const byName = new Map<string, number[]>();

  for (let index = 1; index < runs.length; index++) {
    const minutes = (runs[index].start.getTime() - runs[index - 1].end.getTime()) / MINUTE_MS;
    if (minutes > MAX_RESPONSE_HOURS * 60) continue;

    const sender = runs[index].sender;
    byName.set(sender, [...(byName.get(sender) ?? []), minutes]);
  }

  return byName;
}

/** Uma mensagem inicia conversa quando é a primeira ou quando passou pausa suficientemente longa. */
function countConversationStarts(messages: ChatMessage[]): Map<string, number> {
  const counts = new Map<string, number>();

  messages.forEach((message, index) => {
    const previous: ChatMessage | undefined = messages[index - 1];
    const gapMs = previous ? message.timestamp.getTime() - previous.timestamp.getTime() : Infinity;
    if (gapMs >= CONVERSATION_GAP_HOURS * HOUR_MS) {
      counts.set(message.sender, (counts.get(message.sender) ?? 0) + 1);
    }
  });

  return counts;
}

/**
 * Conta, para cada pessoa, as vezes em que não respondeu no prazo de UNANSWERED_WINDOW_HOURS
 * a uma sequência de mensagens da outra. Só conta quando o prazo já terminou dentro da conversa,
 * para não penalizar mensagens recentes.
 */
function countUnanswered(runs: Run[], names: string[], messages: ChatMessage[]): Map<string, number> {
  const windowMs = UNANSWERED_WINDOW_HOURS * HOUR_MS;
  const chatEnd = messages[messages.length - 1].timestamp.getTime();
  const counts = new Map<string, number>();

  runs.forEach((run, index) => {
    const next: Run | undefined = runs[index + 1];
    const isUnanswered = next
      ? next.start.getTime() - run.end.getTime() > windowMs
      : chatEnd - run.end.getTime() >= windowMs;
    if (!isUnanswered) return;

    const nonResponder = names.find((name) => name !== run.sender);
    if (nonResponder) counts.set(nonResponder, (counts.get(nonResponder) ?? 0) + 1);
  });

  return counts;
}

function findLongestMessage(texts: ChatMessage[]): LongestMessage | null {
  let longest: LongestMessage | null = null;

  for (const message of texts) {
    const words = countWords(message.text);
    if (!longest || words > longest.words) {
      longest = { text: message.text, words, timestamp: message.timestamp };
    }
  }

  return longest && longest.words > 0 ? longest : null;
}

function findTopWords(texts: ChatMessage[]): WordCount[] {
  const counts = new Map<string, number>();

  for (const message of texts) {
    for (const token of tokenise(message.text)) {
      if (token.length < 3 || STOPWORDS.has(token) || isRepeatedLetter(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word, "pt-PT"))
    .slice(0, TOP_WORDS_LIMIT);
}

/** Ignora risadas e ruído como "aaaa" ou "kkkk", que dominariam a lista. */
function isRepeatedLetter(token: string): boolean {
  return /^(.)\1+$/.test(token);
}

function countWords(text: string): number {
  return stripMarkers(text)
    .split(/\s+/)
    .filter((part) => part.length > 0).length;
}

function countDistinctDays(messages: ChatMessage[]): number {
  return new Set(messages.map((message) => dayKey(message.timestamp))).size;
}

function countCalendarDays(first: Date, last: Date): number {
  const firstDay = new Date(first.getFullYear(), first.getMonth(), first.getDate()).getTime();
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime();
  return Math.round((lastDay - firstDay) / DAY_MS) + 1;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
