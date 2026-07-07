"use server";

import { createClient } from "@supabase/supabase-js";
import { libraryAssets as mockAssets } from "@/features/production/mock-data";
import type { LibraryAsset } from "@/features/production/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToAsset(row: any): LibraryAsset {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    category: row.category ?? "",
    size: row.size ?? "",
    updatedAt: row.updated_at.split("T")[0],
    tag: row.tag ?? "",
  };
}

export async function getLibraryAssets(workspaceId = DEFAULT_WORKSPACE): Promise<LibraryAsset[]> {
  const supabase = getServerClient();
  if (!supabase) return mockAssets;

  const { data, error } = await supabase
    .from("library_assets")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) return mockAssets;
  return data.map(dbToAsset);
}

export async function addLibraryAsset(input: Omit<LibraryAsset, "id">, workspaceId = DEFAULT_WORKSPACE): Promise<LibraryAsset> {
  const supabase = getServerClient();
  if (!supabase) return { ...input, id: Date.now() };

  const { data, error } = await supabase
    .from("library_assets")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      type: input.type,
      category: input.category || null,
      size: input.size || null,
      tag: input.tag || null,
      url: null,
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToAsset(data);
}

export async function deleteLibraryAsset(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("library_assets")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}
