import { MessagesSquare } from "lucide-react";
import { ConversationAnalysisView } from "@/features/analise-conversas/components/conversation-analysis-view";

export default function AnaliseConversasPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="brand-pill">
            <MessagesSquare className="h-4 w-4" />
            Análise de conversas
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Análise de Conversas</h2>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
              Anexa uma conversa exportada do WhatsApp e vê as métricas factuais: mensagens, tempos de
              resposta, quem inicia conversas e palavras mais usadas.
            </p>
          </div>
        </div>
      </section>

      <ConversationAnalysisView />
    </div>
  );
}
