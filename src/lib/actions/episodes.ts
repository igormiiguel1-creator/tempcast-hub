"use server";

import { createClient } from "@supabase/supabase-js";
import {
  episodes as mockEpisodes,
} from "@/features/production/mock-data";
import type { Episode, ChecklistItem, ProductionAttachment, TimelineItem, ProductionActivity } from "@/features/production/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToEpisode(row: any): Episode {
  return {
    id: row.id,
    title: row.title,
    guest: row.guest ?? "",
    editor: row.editor ?? "",
    sponsor: row.sponsor ?? "",
    status: row.status as Episode["status"],
    recordingDate: row.recording_date ?? "",
    editingDate: row.editing_date ?? "",
    publicationDate: row.publication_date ?? "",
    assignedGuest: row.guest ?? "",
    assignedEditor: row.editor ?? "",
    priority: row.priority as Episode["priority"],
    duration: row.duration ?? "",
    platformStatus: row.platform_status ?? "",
    overview: row.overview ?? "",
    notes: row.notes ?? "",
    sponsors: row.sponsors ?? [],
    checklist: (row.checklist as unknown as ChecklistItem[]) ?? [],
    files: (row.files as unknown as ProductionAttachment[]) ?? [],
    timeline: (row.timeline as unknown as TimelineItem[]) ?? [],
    recentActivity: (row.recent_activity as unknown as ProductionActivity[]) ?? [],
    attachments: row.attachments ?? [],
  };
}

export async function getEpisodes(workspaceId = DEFAULT_WORKSPACE): Promise<Episode[]> {
  const supabase = getServerClient();
  if (!supabase) return mockEpisodes;

  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error || !data) return mockEpisodes;
  return data.map(dbToEpisode);
}

export async function createEpisode(
  input: Omit<Episode, "id">,
  workspaceId = DEFAULT_WORKSPACE
): Promise<Episode> {
  const supabase = getServerClient();
  if (!supabase) {
    return { ...input, id: Date.now() };
  }

  const { data, error } = await supabase
    .from("episodes")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      guest: input.guest || null,
      editor: input.editor || null,
      sponsor: input.sponsor || null,
      status: input.status,
      recording_date: input.recordingDate || null,
      editing_date: input.editingDate || null,
      publication_date: input.publicationDate || null,
      priority: input.priority,
      duration: input.duration || null,
      platform_status: input.platformStatus || null,
      overview: input.overview || null,
      notes: input.notes || null,
      sponsors: input.sponsors ?? [],
      checklist: input.checklist ?? [],
      files: input.files ?? [],
      timeline: input.timeline ?? [],
      recent_activity: input.recentActivity ?? [],
      attachments: input.attachments ?? [],
      archived: false,
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToEpisode(data);
}

export async function updateEpisode(
  id: number,
  updates: Partial<Episode>,
  workspaceId = DEFAULT_WORKSPACE
): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.guest !== undefined) dbUpdates.guest = updates.guest;
  if (updates.editor !== undefined) dbUpdates.editor = updates.editor;
  if (updates.sponsor !== undefined) dbUpdates.sponsor = updates.sponsor;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.recordingDate !== undefined) dbUpdates.recording_date = updates.recordingDate;
  if (updates.editingDate !== undefined) dbUpdates.editing_date = updates.editingDate;
  if (updates.publicationDate !== undefined) dbUpdates.publication_date = updates.publicationDate;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.overview !== undefined) dbUpdates.overview = updates.overview;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
  if (updates.timeline !== undefined) dbUpdates.timeline = updates.timeline;
  if (updates.recentActivity !== undefined) dbUpdates.recent_activity = updates.recentActivity;

  await supabase
    .from("episodes")
    .update(dbUpdates)
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function deleteEpisode(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("episodes")
    .update({ archived: true })
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function archiveEpisode(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  await updateEpisode(id, { status: "Published" }, workspaceId);
}

export async function duplicateEpisode(id: number, episodes: Episode[], workspaceId = DEFAULT_WORKSPACE): Promise<Episode> {
  const source = episodes.find((e) => e.id === id);
  if (!source) throw new Error("Episódio não encontrado");
  return createEpisode({ ...source, title: `${source.title} (cópia)` }, workspaceId);
}
