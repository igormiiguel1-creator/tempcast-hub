"use server";

import { createClient } from "@supabase/supabase-js";
import { guests as mockGuests } from "@/features/convidados/mock-data";
import type { Guest } from "@/features/convidados/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToGuest(row: any): Guest {
  return {
    id: row.id,
    name: row.name,
    profession: row.profession ?? "",
    company: row.company ?? "",
    status: row.status as Guest["status"],
    priority: row.priority as Guest["priority"],
    favorite: row.favorite,
    recordingDate: row.recording_date ?? "TBD",
    publicationDate: row.publication_date ?? "TBD",
    biography: row.biography ?? "",
    notes: row.notes ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    instagram: row.instagram ?? "",
    linkedin: row.linkedin ?? "",
    website: row.website ?? "",
    contactDate: row.contact_date ?? "",
    confirmationDate: row.confirmation_date ?? "",
    editingDate: row.editing_date ?? "",
    recentActivity: (row.recent_activity as unknown as Guest["recentActivity"]) ?? [],
    expenses: (row.expenses as unknown as Guest["expenses"]) ?? { cachet: "€0", hotel: "€0", transport: "€0", meals: "€0", other: "€0" },
    checklist: (row.checklist as unknown as Guest["checklist"]) ?? [],
    attachments: row.attachments ?? [],
    timeline: (row.timeline as unknown as Guest["timeline"]) ?? [],
    initials: row.initials ?? row.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
  };
}

export async function getGuests(workspaceId = DEFAULT_WORKSPACE): Promise<Guest[]> {
  const supabase = getServerClient();
  if (!supabase) return mockGuests;

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) return mockGuests;
  return data.map(dbToGuest);
}

export async function createGuest(input: Omit<Guest, "id">, workspaceId = DEFAULT_WORKSPACE): Promise<Guest> {
  const supabase = getServerClient();
  if (!supabase) return { ...input, id: Date.now() };

  const { data, error } = await supabase
    .from("guests")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      profession: input.profession || null,
      company: input.company || null,
      status: input.status,
      priority: input.priority,
      favorite: input.favorite ?? false,
      recording_date: input.recordingDate || null,
      publication_date: input.publicationDate || null,
      biography: input.biography || null,
      notes: input.notes || null,
      email: input.email || null,
      phone: input.phone || null,
      instagram: input.instagram || null,
      linkedin: input.linkedin || null,
      website: input.website || null,
      contact_date: input.contactDate || null,
      confirmation_date: input.confirmationDate || null,
      editing_date: input.editingDate || null,
      recent_activity: input.recentActivity ?? [],
      expenses: input.expenses ?? {},
      checklist: input.checklist ?? [],
      attachments: input.attachments ?? [],
      timeline: input.timeline ?? [],
      initials: input.initials || null,
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToGuest(data);
}

export async function updateGuest(id: number, updates: Partial<Guest>, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.profession !== undefined) dbUpdates.profession = updates.profession;
  if (updates.company !== undefined) dbUpdates.company = updates.company;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;
  if (updates.recordingDate !== undefined) dbUpdates.recording_date = updates.recordingDate;
  if (updates.biography !== undefined) dbUpdates.biography = updates.biography;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram;
  if (updates.linkedin !== undefined) dbUpdates.linkedin = updates.linkedin;
  if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
  if (updates.expenses !== undefined) dbUpdates.expenses = updates.expenses;

  await supabase
    .from("guests")
    .update(dbUpdates)
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function deleteGuest(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("guests")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function toggleGuestFavorite(id: number, currentFavorite: boolean, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  await updateGuest(id, { favorite: !currentFavorite }, workspaceId);
}
