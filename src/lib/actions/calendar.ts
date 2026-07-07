"use server";

import { createClient } from "@supabase/supabase-js";
import { calendarEvents as mockEvents } from "@/features/production/mock-data";
import type { CalendarEvent } from "@/features/production/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToEvent(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    type: row.type as CalendarEvent["type"],
    date: row.date,
    time: row.time ?? "",
    location: row.location ?? "",
    summary: row.summary ?? "",
    accent: row.accent ?? "bg-primary/10 text-primary",
  };
}

export async function getCalendarEvents(workspaceId = DEFAULT_WORKSPACE): Promise<CalendarEvent[]> {
  const supabase = getServerClient();
  if (!supabase) return mockEvents;

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("date", { ascending: true });

  if (error || !data) return mockEvents;
  return data.map(dbToEvent);
}

export async function addCalendarEvent(input: Omit<CalendarEvent, "id">, workspaceId = DEFAULT_WORKSPACE): Promise<CalendarEvent> {
  const supabase = getServerClient();
  if (!supabase) return { ...input, id: Date.now() };

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      type: input.type,
      date: input.date,
      time: input.time || null,
      location: input.location || null,
      summary: input.summary || null,
      accent: input.accent || null,
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToEvent(data);
}

export async function updateCalendarEvent(id: number, updates: Partial<CalendarEvent>, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.summary !== undefined) dbUpdates.summary = updates.summary;

  await supabase
    .from("calendar_events")
    .update(dbUpdates)
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function deleteCalendarEvent(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("calendar_events")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}
