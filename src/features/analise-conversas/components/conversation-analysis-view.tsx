"use client";

import { useMemo, useState } from "react";
import { FileText, RotateCcw, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyseConversation, getAnalysisError } from "../services/conversation-analysis.service";
import { parseWhatsAppExport } from "../services/whatsapp-parser.service";
import type { AnalysisError, ChatMessage } from "../types";
import { AnalysisReport } from "./analysis-report";

const ERROR_TEXT: Record<AnalysisError, string> = {
  "unrecognised-format":
    "Não reconhecemos o formato desta conversa. Exporta o chat do WhatsApp em formato .txt.",
  "too-few-messages":
    "Encontrámos poucas mensagens. Confirma que exportaste a conversa sem média.",
  "single-participant":
    "Só uma pessoa enviou mensagens. A análise precisa das mensagens dos dois lados.",
};

type LoadedChat = {
  fileName: string;
  messages: ChatMessage[];
};

export function ConversationAnalysisView() {
  const [loaded, setLoaded] = useState<LoadedChat | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [selfName, setSelfName] = useState<string | null>(null);

  const analysis = useMemo(
    () => (loaded ? analyseConversation(loaded.messages) : null),
    [loaded],
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsReading(true);
    setErrorText(null);
    try {
      const messages = parseWhatsAppExport(await file.text());
      const error = getAnalysisError(messages);
      if (error) {
        setLoaded(null);
        setErrorText(ERROR_TEXT[error]);
        return;
      }
      setLoaded({ fileName: file.name, messages });
      setSelfName(analyseConversation(messages).participants[0]?.name ?? null);
    } catch {
      setLoaded(null);
      setErrorText("Não foi possível ler este ficheiro. Tenta outra exportação.");
    } finally {
      setIsReading(false);
    }
  }

  function handleReset() {
    setLoaded(null);
    setErrorText(null);
    setSelfName(null);
  }

  if (!analysis || !loaded) {
    return (
      <section className="brand-card flex flex-col gap-6 p-6 sm:p-8">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">Carregar conversa</h2>
          <p className="text-sm text-muted-foreground">
            No WhatsApp, abre a conversa, toca em ⋮ → Mais → Exportar conversa → Sem média, e escolhe
            o ficheiro .txt. Se o ficheiro vier num .zip, extrai primeiro o _chat.txt.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90">
            <Upload className="h-4 w-4" />
            {isReading ? "A ler conversa…" : "Escolher ficheiro .txt"}
            <input
              type="file"
              accept=".txt,text/plain"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isReading}
            />
          </label>

          {errorText && (
            <p role="alert" className="rounded-2xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-sm text-red-600">
              {errorText}
            </p>
          )}
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          A conversa é analisada no teu navegador. Nada é enviado nem guardado.
        </p>
      </section>
    );
  }

  const isDirect = analysis.isDirect;

  return (
    <div className="flex flex-col gap-6">
      <section className="brand-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="h-5 w-5 shrink-0 text-primary" />
          <p className="truncate text-sm font-medium">{loaded.fileName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isDirect && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Quem és tu?
              <select
                value={selfName ?? ""}
                onChange={(event) => setSelfName(event.target.value)}
                className="rounded-full border border-input bg-background/80 px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary"
              >
                {analysis.participants.map((participant) => (
                  <option key={participant.name} value={participant.name}>
                    {participant.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Nova conversa
          </Button>
        </div>
      </section>

      <AnalysisReport analysis={analysis} selfName={selfName} />
    </div>
  );
}
