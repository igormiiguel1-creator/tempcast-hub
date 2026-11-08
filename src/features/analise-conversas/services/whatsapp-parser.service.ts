import type { ChatMessage, MessageKind } from "../types";

/**
 * Cobre os dois formatos de exportação do WhatsApp:
 * - Android: "12/03/2024, 22:15 - Ana: olá"
 * - iOS:     "[12/03/2024, 22:15:03] Ana: olá"
 * Também aceita hora em 12h ("10:15 PM") e datas com ponto, hífen ou barra.
 */
const LINE_PATTERN =
  /^\[?(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?)(?:\s*([AaPp]\.?[Mm]\.?)(?=\s*[\]-]))?\]?\s*(?:-\s*)?(.*)$/;

const DELETED_PATTERN =
  /^(this message was deleted|you deleted this message|esta mensagem foi apagada|apagaste esta mensagem|eliminaste esta mensagem|mensagem apagada)\.?$/i;

const MEDIA_PATTERN = /^<[^>]*(omitted|omitido|omitida|attached|anexad)[^>]*>$|\b(omitted|omitido|omitida)$/i;

type RawEntry = {
  dateText: string;
  timeText: string;
  meridiem: string | undefined;
  body: string;
};

/**
 * Converte o texto de uma exportação do WhatsApp em mensagens.
 * Mensagens de sistema (sem "Nome: texto") são ignoradas.
 * Linhas sem data no início são tratadas como continuação da mensagem anterior.
 */
export function parseWhatsAppExport(raw: string): ChatMessage[] {
  const entries = readEntries(normaliseText(raw));
  const dayFirst = detectDayFirst(entries);

  const messages: ChatMessage[] = [];
  for (const entry of entries) {
    const message = toChatMessage(entry, dayFirst);
    if (message) messages.push(message);
  }
  return messages;
}

/** Remove marcadores como "<Multimédia omitido>" para não contarem como palavras. */
export function stripMarkers(text: string): string {
  return text.replace(/<[^>]*>/g, " ");
}

/** Tokenização usada pela análise de palavras. Separa por tudo o que não seja letra latina. */
export function tokenise(text: string): string[] {
  return stripMarkers(text)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .split(/[^a-zÀ-ɏ]+/)
    .filter((token) => token.length > 0);
}

function normaliseText(raw: string): string {
  return raw
    .replace(/^﻿/, "")
    .replace(/[‎‏‪-‮⁦-⁩]/g, "")
    .replace(/[  ]/g, " ");
}

function readEntries(text: string): RawEntry[] {
  const entries: RawEntry[] = [];
  let current: RawEntry | null = null;

  for (const line of text.split(/\r?\n/)) {
    const match = LINE_PATTERN.exec(line);
    if (match) {
      current = {
        dateText: match[1],
        timeText: match[2],
        meridiem: match[3],
        body: match[4],
      };
      entries.push(current);
    } else if (current) {
      current.body += `\n${line}`;
    }
  }

  return entries;
}

/**
 * Em exportações com datas em formato americano (mês/dia), há sempre um valor acima de 12
 * na segunda posição. Sem essa pista, assume-se dia/mês (formato português).
 */
function detectDayFirst(entries: RawEntry[]): boolean {
  let firstAboveTwelve = false;
  let secondAboveTwelve = false;

  for (const entry of entries) {
    const [first, second] = entry.dateText.split(/[/.-]/).map(Number);
    if (first > 12) firstAboveTwelve = true;
    if (second > 12) secondAboveTwelve = true;
  }

  return !(secondAboveTwelve && !firstAboveTwelve);
}

function toChatMessage(entry: RawEntry, dayFirst: boolean): ChatMessage | null {
  const separator = entry.body.indexOf(": ");
  if (separator === -1) return null; // mensagem de sistema

  const sender = entry.body.slice(0, separator).replace(/^~\s*/, "").trim();
  const text = entry.body.slice(separator + 2).trim();
  const timestamp = toDate(entry, dayFirst);
  if (!sender || !timestamp) return null;

  return { timestamp, sender, text, kind: classify(text) };
}

function classify(text: string): MessageKind {
  if (DELETED_PATTERN.test(text)) return "deleted";
  if (MEDIA_PATTERN.test(text)) return "media";
  return "text";
}

function toDate(entry: RawEntry, dayFirst: boolean): Date | null {
  const [first, second, yearPart] = entry.dateText.split(/[/.-]/).map(Number);
  const day = dayFirst ? first : second;
  const month = dayFirst ? second : first;
  const year = yearPart < 100 ? 2000 + yearPart : yearPart;

  const [rawHour, minute, seconds = 0] = entry.timeText.split(":").map(Number);
  let hour = rawHour;
  if (entry.meridiem) {
    const isPm = entry.meridiem.toLowerCase().startsWith("p");
    hour = (rawHour % 12) + (isPm ? 12 : 0);
  }

  const date = new Date(year, month - 1, day, hour, minute, seconds);
  const isValid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isValid ? date : null;
}
