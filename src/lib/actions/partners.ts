"use server";

import { createClient } from "@supabase/supabase-js";
import { partners as mockPartners } from "@/features/production/mock-data";
import type { Partner } from "@/features/production/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToPartner(row: any): Partner {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    contractValue: row.contract_value ?? "€0",
    nextMeeting: row.next_meeting ?? "",
    notes: row.notes ?? "",
    contact: row.contact ?? "",
    renewalDate: row.renewal_date ?? "",
  };
}

export async function getPartners(workspaceId = DEFAULT_WORKSPACE): Promise<Partner[]> {
  const supabase = getServerClient();
  if (!supabase) return mockPartners;

  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) return mockPartners;
  return data.map(dbToPartner);
}

export async function createPartner(input: Omit<Partner, "id">, workspaceId = DEFAULT_WORKSPACE): Promise<Partner> {
  const supabase = getServerClient();
  if (!supabase) return { ...input, id: Date.now() };

  let pType = input.type;
  if (pType !== "Sponsor" && pType !== "Partner" && pType !== "Parceiro" && pType !== "Patrocinador" && pType !== "Media") {
    pType = "Partner";
  }

  const { data, error } = await supabase
    .from("partners")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      type: pType,
      status: input.status,
      contract_value: input.contractValue || null,
      next_meeting: input.nextMeeting || null,
      notes: input.notes || null,
      contact: input.contact || null,
      renewal_date: input.renewalDate || null,
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToPartner(data);
}

export async function updatePartner(id: number, updates: Partial<Partner>, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.contractValue !== undefined) dbUpdates.contract_value = updates.contractValue;
  if (updates.nextMeeting !== undefined) dbUpdates.next_meeting = updates.nextMeeting;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
  if (updates.renewalDate !== undefined) dbUpdates.renewal_date = updates.renewalDate;

  await supabase
    .from("partners")
    .update(dbUpdates)
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function deletePartner(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("partners")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}
