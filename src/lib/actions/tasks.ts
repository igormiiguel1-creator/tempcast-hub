"use server";

import { createClient } from "@supabase/supabase-js";
import { tasks as mockTasks } from "@/features/production/mock-data";
import type { TaskItem, ChecklistItem, ProductionActivity } from "@/features/production/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToTask(row: any): TaskItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    priority: row.priority as TaskItem["priority"],
    assignee: row.assignee ?? "",
    dueDate: row.due_date ?? "",
    section: row.section as TaskItem["section"],
    episode: row.episode ?? "",
    guest: row.guest ?? "",
    checklist: (row.checklist as unknown as ChecklistItem[]) ?? [],
    comments: row.comments ?? [],
    attachments: row.attachments ?? [],
    activity: (row.activity as unknown as ProductionActivity[]) ?? [],
  };
}

export async function getTasks(workspaceId = DEFAULT_WORKSPACE): Promise<TaskItem[]> {
  const supabase = getServerClient();
  if (!supabase) return mockTasks;

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) return mockTasks;
  return data.map(dbToTask);
}

export async function createTask(input: Omit<TaskItem, "id">, workspaceId = DEFAULT_WORKSPACE): Promise<TaskItem> {
  const supabase = getServerClient();
  if (!supabase) return { ...input, id: Date.now() };

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      assignee: input.assignee || null,
      due_date: input.dueDate || null,
      section: input.section,
      episode: input.episode || null,
      guest: input.guest || null,
      checklist: input.checklist ?? [],
      comments: input.comments ?? [],
      attachments: input.attachments ?? [],
      activity: input.activity ?? [],
      completed: false,
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToTask(data);
}

export async function updateTask(id: number, updates: Partial<TaskItem>, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.assignee !== undefined) dbUpdates.assignee = updates.assignee;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.section !== undefined) dbUpdates.section = updates.section;
  if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;

  await supabase
    .from("tasks")
    .update(dbUpdates)
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function toggleTaskComplete(id: number, currentSection: string, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const newSection = currentSection === "Completed" ? "Today" : "Completed";
  const completed = newSection === "Completed";
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("tasks")
    .update({ section: newSection, completed })
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function moveTask(id: number, section: TaskItem["section"], workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  await updateTask(id, { section }, workspaceId);
}

export async function deleteTask(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("tasks")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}
