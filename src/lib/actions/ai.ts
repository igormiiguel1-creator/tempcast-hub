"use server";

import { createClient } from "@supabase/supabase-js";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  action?: {
    type: "create" | "update" | "delete";
    entity: string;
    data: unknown;
    confirmed: boolean;
  };
}

export interface AIConversation {
  id: string;
  title: string | null;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

export async function getAIConversations(workspaceId = DEFAULT_WORKSPACE): Promise<AIConversation[]> {
  const supabase = getServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    title: row.title,
    messages: (row.messages as AIMessage[]) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createAIConversation(
  messages: AIMessage[],
  title?: string,
  workspaceId = DEFAULT_WORKSPACE
): Promise<AIConversation> {
  const supabase = getServerClient();

  const fallback: AIConversation = {
    id: `local-${Date.now()}`,
    title: title ?? null,
    messages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!supabase) return fallback;

  const { data } = await supabase
    .from("ai_conversations")
    .insert({
      workspace_id: workspaceId,
      title: title ?? null,
      messages: messages,
    })
    .select()
    .single();

  if (!data) return fallback;

  const row = data as any;

  return {
    id: row.id,
    title: row.title,
    messages: (row.messages as AIMessage[]) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function appendAIMessage(
  conversationId: string,
  message: AIMessage,
  currentMessages: AIMessage[],
  workspaceId = DEFAULT_WORKSPACE
): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const updated = [...currentMessages, message];

  await supabase
    .from("ai_conversations")
    .update({
      messages: updated,
    })
    .eq("workspace_id", workspaceId)
    .eq("id", conversationId);
}

export async function deleteAIConversation(id: string, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("ai_conversations")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

// ──────────────────────────────────────────────────────────────
// Processamento de acções de IA
// O assistente pode sugerir acções CRUD que o utilizador confirma
// ──────────────────────────────────────────────────────────────

export interface AIPendingAction {
  id: string;
  type: "create" | "update" | "delete";
  entity: "episode" | "guest" | "task" | "partner" | "social_post" | "finance_entry" | "calendar_event";
  description: string;
  data: Record<string, unknown>;
  confirmed: boolean;
}

export async function processAIAction(action: AIPendingAction): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    switch (action.entity) {
      case "episode": {
        const { createEpisode, updateEpisode, deleteEpisode } = await import("./episodes");
        if (action.type === "create") await createEpisode(action.data as any);
        if (action.type === "update") await updateEpisode(action.data.id as number, action.data as any);
        if (action.type === "delete") await deleteEpisode(action.data.id as number);
        break;
      }
      case "guest": {
        const { createGuest, updateGuest, deleteGuest } = await import("./guests");
        if (action.type === "create") await createGuest(action.data as any);
        if (action.type === "update") await updateGuest(action.data.id as number, action.data as any);
        if (action.type === "delete") await deleteGuest(action.data.id as number);
        break;
      }
      case "task": {
        const { createTask, updateTask, deleteTask } = await import("./tasks");
        if (action.type === "create") await createTask(action.data as any);
        if (action.type === "update") await updateTask(action.data.id as number, action.data as any);
        if (action.type === "delete") await deleteTask(action.data.id as number);
        break;
      }
      case "finance_entry": {
        const { createFinanceEntry, updateFinanceEntry, deleteFinanceEntry } = await import("./finance");
        if (action.type === "create") await createFinanceEntry(action.data as any);
        if (action.type === "update") await updateFinanceEntry(action.data.id as number, action.data as any);
        if (action.type === "delete") await deleteFinanceEntry(action.data.id as number);
        break;
      }
      default:
        return { success: false, message: `Entidade '${action.entity}' não suportada.` };
    }
    return { success: true, message: `Ação ${action.type} em ${action.entity} executada com sucesso.` };
  } catch (err) {
    console.error("Erro ao processar ação de IA:", err);
    return { success: false, message: "Ocorreu um erro ao executar a ação." };
  }
}
