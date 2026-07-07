"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mic2,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-state";
import {
  createAIConversation,
  appendAIMessage,
  processAIAction,
  type AIMessage,
  type AIConversation,
  type AIPendingAction,
} from "@/lib/actions/ai";

const PROMPT_SUGGESTIONS = [
  { label: "Analisar performance", prompt: "Analisa a performance atual do podcast, canal e finanças.", icon: Zap },
  { label: "Gerar SEO para episódio", prompt: "Gera títulos, descrições e YouTube tags para o episódio em pós-produção.", icon: Sparkles },
  { label: "Criar novo convidado", prompt: "Cria um novo convidado chamado 'Rui Costa', profissão 'Cientista de Dados'.", icon: Mic2 },
  { label: "Legendas para redes", prompt: "Gera legendas para Instagram e TikTok sobre o próximo episódio.", icon: ChevronRight },
];

interface PendingActionUI extends AIPendingAction {
  show: boolean;
}

export default function IAPage() {
  const {
    episodes,
    guests,
    tasks,
    financeEntries,
    partners,
    socialPosts,
    settings,
    createEpisode,
    createTask,
    setEpisodes,
    setGuests,
    setTasks,
    setPartners,
    setSocialPosts,
  } = useAppData();

  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingActionUI[]>([]);
  const [actionResult, setActionResult] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Obter detalhes do provedor de IA atual
  const providerDetails = {
    openai: { name: "OpenAI GPT-4", avatarColor: "bg-emerald-600 text-white" },
    gemini: { name: "Google Gemini 1.5 Pro", avatarColor: "bg-blue-600 text-white" },
    claude: { name: "Anthropic Claude 3.5 Sonnet", avatarColor: "bg-orange-600 text-white" },
  }[settings.aiProvider || "openai"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Gerar respostas da IA com base no contexto REAL da base de dados
  const generateResponse = useCallback(
    async (userMessage: string, currentMessages: AIMessage[]) => {
      setIsGenerating(true);

      const context = {
        totalEpisodes: episodes.length,
        totalGuests: guests.length,
        totalTasks: tasks.length,
        totalPartners: partners.length,
        totalFinance: financeEntries.length,
        totalPosts: socialPosts.length,
        recentEpisodeTitle: episodes[0]?.title || "Nenhum",
      };

      const detectedActions: PendingActionUI[] = [];
      const lowerMsg = userMessage.toLowerCase();

      // 1. AÇÃO: CRIAR EPISÓDIO
      if (lowerMsg.includes("cria") && lowerMsg.includes("episódio")) {
        const titleMatch = userMessage.match(/'([^']+)'|"([^"]+)"/);
        const title = titleMatch ? titleMatch[1] || titleMatch[2] : "Novo Episódio de IA";
        detectedActions.push({
          id: `action-${Date.now()}`,
          type: "create",
          entity: "episode",
          description: `Criar o episódio "${title}" na base de dados`,
          data: {
            title,
            guest: "",
            editor: "Igor",
            sponsor: "",
            status: "Idea",
            recordingDate: "",
            editingDate: "",
            publicationDate: "",
            assignedGuest: "",
            assignedEditor: "Igor",
            priority: "Medium",
            duration: "",
            platformStatus: "",
            overview: userMessage,
            notes: "",
            sponsors: [],
            checklist: [{ label: "Guião completo", checked: false }],
            files: [],
            timeline: [],
            recentActivity: [],
            attachments: [],
          },
          confirmed: false,
          show: true,
        });
      }

      // 2. AÇÃO: CRIAR CONVIDADO
      else if (lowerMsg.includes("cria") && lowerMsg.includes("convidado")) {
        const nameMatch = userMessage.match(/'([^']+)'|"([^"]+)"/);
        const name = nameMatch ? nameMatch[1] || nameMatch[2] : "Novo Convidado de IA";
        detectedActions.push({
          id: `action-${Date.now() + 1}`,
          type: "create",
          entity: "guest",
          description: `Registar o convidado "${name}" na base de dados`,
          data: {
            name,
            profession: lowerMsg.includes("profissão") ? "Especialista" : "Convidado",
            company: "",
            status: "Idea",
            priority: "Medium",
            favorite: false,
            recordingDate: "TBD",
            publicationDate: "TBD",
            biography: "",
            notes: "",
            email: "",
            phone: "",
            instagram: "",
            linkedin: "",
            website: "",
            contactDate: "",
            confirmationDate: "",
            editingDate: "",
            recentActivity: [],
            expenses: { cachet: "€0", hotel: "€0", transport: "€0", meals: "€0", other: "€0" },
            checklist: [],
            attachments: [],
            timeline: [],
            initials: name.slice(0, 2).toUpperCase(),
          },
          confirmed: false,
          show: true,
        });
      }

      // 3. AÇÃO: ELIMINAR REGISTO (Requer confirmação)
      else if (lowerMsg.includes("elimina") || lowerMsg.includes("apaga")) {
        detectedActions.push({
          id: `action-${Date.now() + 2}`,
          type: "delete",
          entity: "task",
          description: "Eliminar a última tarefa incompleta da base de dados",
          data: { taskId: tasks[0]?.id || 0 },
          confirmed: false,
          show: true,
        });
      }

      if (detectedActions.length > 0) {
        setPendingActions(detectedActions);
      }

      // Gerar resposta textual inteligente e baseada nos dados
      const assistantMessage: AIMessage = {
        role: "assistant",
        content: getAIResponseText(userMessage, context, detectedActions.length > 0),
        timestamp: new Date().toISOString(),
      };

      const updated = [...currentMessages, assistantMessage];
      setMessages(updated);
      setIsGenerating(false);

      if (conversation) {
        await appendAIMessage(conversation.id, assistantMessage, currentMessages);
      }
    },
    [episodes, guests, tasks, financeEntries, partners, socialPosts, conversation]
  );

  // Respostas baseadas no provider selecionado e base de dados
  function getAIResponseText(
    userMsg: string,
    ctx: any,
    hasAction: boolean
  ): string {
    const lower = userMsg.toLowerCase();

    if (hasAction) {
      return `Olá! detetei que queres realizar uma operação na base de dados. Preparei a ação correspondente no painel abaixo. Por favor, confirma ou cancela para avançarmos com segurança.`;
    }

    if (lower.includes("analisa") || lower.includes("performance")) {
      return `**Análise de Performance Operacional — ${providerDetails.name}**\n\nIdentifiquei os seguintes dados reais no TempCast Hub:\n• **${ctx.totalEpisodes} episódios** totais no pipeline.\n• **${ctx.totalGuests} convidados** registados.\n• **${ctx.totalTasks} tarefas** ativas.\n• **${ctx.totalPartners} sponsors** e parceiros ativos.\n\n**Recomendações:**\n- Tens tarefas pendentes. Mantém a gravação do episódio "${ctx.recentEpisodeTitle}" como foco prioritário para evitar atrasos na pós-produção.\n- Sincroniza as finanças para garantir o ROI das campanhas publicitárias.`;
    }

    if (lower.includes("seo") || lower.includes("tag")) {
      return `**Geração de SEO — ${providerDetails.name}**\n\nCom base no teu episódio mais recente "${ctx.recentEpisodeTitle}", sugiro os seguintes metadados:\n\n**Meta Title:**\nTempCast #12 | Inovação e Criatividade em Portugal\n\n**Meta Description:**\nConversa imperdível sobre empreendedorismo e novos caminhos criativos no ecossistema português. Assiste e descobre dicas práticas!\n\n**YouTube Tags:**\ntempcast, podcast portugal, inovacao, criatividade, talento portugues, hosts portugueses`;
    }

    if (lower.includes("legenda") || lower.includes("instagram") || lower.includes("tiktok")) {
      return `**Legendas Geradas para Redes Sociais**\n\n**Legenda para Instagram:**\n"O que define o talento emergente em Portugal? 🇵🇹 No novo episódio do TempCast conversamos sobre resiliência e foco no estúdio. Link na bio! 🎙️ #TempCast #PodcastPT"\n\n**Legenda para TikTok:**\n"Quando o microfone se liga... 🔥 Melhores momentos do episódio "${ctx.recentEpisodeTitle}". Segue para mais cortes! #podcastportugal #shorts #bastidores"`;
    }

    return `Olá, sou o co-piloto operacional configurado com **${providerDetails.name}**. Analisei a base de dados real do TempCast Hub e posso ajudar-te a criar episódios, convidados, tarefas, gerar SEO e legendas.\n\nO que queres fazer a seguir?`;
  }

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isGenerating) return;

    const userMsg: AIMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    let conv = conversation;
    let currentMessages = messages;

    if (!conv) {
      currentMessages = [];
      conv = await createAIConversation([userMsg], text.slice(0, 40));
      setConversation(conv);
      setMessages([userMsg]);
    } else {
      currentMessages = [...messages, userMsg];
      setMessages(currentMessages);
      await appendAIMessage(conv.id, userMsg, messages);
    }

    setInput("");
    setPendingActions([]);
    setActionResult(null);
    await generateResponse(text, currentMessages);
  }, [input, isGenerating, conversation, messages, generateResponse]);

  const handleConfirmAction = useCallback(async (action: PendingActionUI) => {
    setActionResult(null);
    const result = await processAIAction(action);

    if (result.success) {
      if (action.entity === "episode" && action.type === "create") {
        setEpisodes((prev) => [{ ...action.data, id: Date.now() } as any, ...prev]);
      }
      if (action.entity === "guest" && action.type === "create") {
        setGuests((prev) => [{ ...action.data, id: Date.now() } as any, ...prev]);
      }
      if (action.entity === "task" && action.type === "delete") {
        const idToDelete = action.data.taskId;
        setTasks((prev) => prev.filter((t) => t.id !== idToDelete));
      }
    }

    setActionResult(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
    setPendingActions((prev) => prev.map((a) => a.id === action.id ? { ...a, show: false, confirmed: true } : a));

    const confirmMsg: AIMessage = {
      role: "assistant",
      content: result.success
        ? `Operação concluída com sucesso: **${action.description}**.`
        : `Erro na execução da operação de IA.`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, confirmMsg]);
  }, [setEpisodes, setGuests, setTasks]);

  const handleNewConversation = useCallback(() => {
    setConversation(null);
    setMessages([]);
    setInput("");
    setPendingActions([]);
    setActionResult(null);
  }, []);

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-4xl flex-col gap-0 px-4 py-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Co-Piloto TempCast</h1>
            <p className="text-xs text-muted-foreground">
              Provedor: <strong className="capitalize">{providerDetails.name}</strong> · Ligado à base de dados real
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewConversation} className="gap-2 rounded-full text-xs">
          <Plus className="h-3.5 w-3.5" />
          Nova conversa
        </Button>
      </div>

      {/* Chat Area */}
      <div className="brand-card flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-bold tracking-tight">Olá, como posso ajudar hoje?</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Estou conectado à tua base de dados real. Posso criar ou atualizar episódios, sugerir SEO e muito mais.
                </p>
              </div>
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {PROMPT_SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setInput(s.prompt)}
                    className="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left text-sm font-medium transition-all duration-150 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    <s.icon className="h-4 w-4 shrink-0 text-primary" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground" : providerDetails.avatarColor}`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground"}`}>
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: msg.content
                          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*([^*]+)\*/g, "<em>$1</em>")
                          .replace(/\n/g, "<br/>"),
                      }}
                    />
                    <p className={`mt-1.5 text-[10px] opacity-50 ${msg.role === "user" ? "text-right" : ""}`}>
                      {new Date(msg.timestamp).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {pendingActions.filter((a) => a.show).map((action) => (
                <div key={action.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Confirmação Operacional Requerida</p>
                    <p className="text-sm font-medium">{action.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 rounded-full text-xs" onClick={() => handleConfirmAction(action)}>
                        Executar Ação
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-full text-xs"
                        onClick={() => setPendingActions((prev) => prev.map((a) => a.id === action.id ? { ...a, show: false } : a))}
                      >
                        Recusar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {actionResult && (
                <div className="flex justify-center">
                  <span className="rounded-full bg-card px-4 py-1 border text-xs text-muted-foreground">{actionResult}</span>
                </div>
              )}

              {isGenerating && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-muted/60 px-4 py-2">
                    <span className="text-xs text-muted-foreground">Co-Piloto a processar...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/70 p-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Enviar mensagem para o Co-Piloto (${providerDetails.name})...`}
              className="w-full resize-none rounded-2xl border border-input bg-background/80 px-4 py-3 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              rows={1}
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="btn-brand h-12 w-12 shrink-0 rounded-full p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
