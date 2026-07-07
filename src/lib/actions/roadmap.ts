"use server";

import { createClient } from "@supabase/supabase-js";
import { roadmapCards as mockCards } from "@/features/production/mock-data";
import type { RoadmapCard } from "@/features/production/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToCard(row: any): RoadmapCard {
  return {
    id: row.id,
    title: row.title,
    stage: row.stage as RoadmapCard["stage"],
    priority: row.priority as RoadmapCard["priority"],
    tags: row.tags ?? [],
    guest: row.guest ?? "",
    episode: row.episode ?? "",
    dueDate: row.due_date ?? "",
    progress: row.progress,
    checklistPreview: row.checklist_preview ?? [],
  };
}

export async function getRoadmapCards(workspaceId = DEFAULT_WORKSPACE): Promise<RoadmapCard[]> {
  const supabase = getServerClient();
  if (!supabase) return mockCards;

  const { data, error } = await supabase
    .from("roadmap_cards")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) return mockCards;
  return data.map(dbToCard);
}

export async function createRoadmapCard(input: Omit<RoadmapCard, "id">, workspaceId = DEFAULT_WORKSPACE): Promise<RoadmapCard> {
  const supabase = getServerClient();
  if (!supabase) return { ...input, id: Date.now() };

  const { data, error } = await supabase
    .from("roadmap_cards")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      stage: input.stage,
      priority: input.priority,
      tags: input.tags ?? [],
      guest: input.guest || null,
      episode: input.episode || null,
      due_date: input.dueDate || null,
      progress: input.progress ?? 0,
      checklist_preview: input.checklistPreview ?? [],
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToCard(data);
}

export async function updateRoadmapCard(id: number, updates: Partial<RoadmapCard>, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

  await supabase
    .from("roadmap_cards")
    .update(dbUpdates)
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function completeRoadmapCard(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  await updateRoadmapCard(id, { progress: 100, stage: "Published" }, workspaceId);
}
