"use server";

import { createClient } from "@supabase/supabase-js";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

export interface WorkspaceSettings {
  language: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
  studioName?: string;
  studioDescription?: string;
  youtubeChannel?: string;
  spotifyShow?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
}

export async function getSettings(workspaceId = DEFAULT_WORKSPACE): Promise<WorkspaceSettings> {
  const defaults: WorkspaceSettings = {
    language: "pt-PT",
    theme: "dark",
    notifications: true,
  };

  const supabase = getServerClient();
  if (!supabase) return defaults;

  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .eq("workspace_id", workspaceId);

  if (!data || data.length === 0) return defaults;

  const settings = { ...defaults };
  for (const row of data) {
    if (row.key === "app") {
      Object.assign(settings, row.value as Partial<WorkspaceSettings>);
    }
  }
  return settings;
}

export async function updateSettings(
  updates: Partial<WorkspaceSettings>,
  workspaceId = DEFAULT_WORKSPACE
): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const current = await getSettings(workspaceId);
  const merged = { ...current, ...updates };

  await supabase
    .from("settings")
    .upsert({
      workspace_id: workspaceId,
      key: "app",
      value: merged,
    }, { onConflict: "workspace_id,key" });
}

export interface ApiCredential {
  platform: string;
  clientId?: string;
  status: string;
  scope?: string;
}

export async function getApiCredentials(workspaceId = DEFAULT_WORKSPACE): Promise<ApiCredential[]> {
  const supabase = getServerClient();
  if (!supabase) return [
    { platform: "youtube", status: "pending" },
    { platform: "meta", status: "pending" },
    { platform: "tiktok", status: "pending" },
    { platform: "spotify", status: "pending" },
    { platform: "openai", status: "pending" },
  ];

  const { data } = await supabase
    .from("api_credentials")
    .select("platform, client_id, status, scope")
    .eq("workspace_id", workspaceId);

  if (!data) return [];

  return data.map((row: any) => ({
    platform: row.platform,
    clientId: row.client_id ?? undefined,
    status: row.status,
    scope: row.scope ?? undefined,
  }));
}

export async function saveApiCredential(
  platform: string,
  clientId: string,
  workspaceId = DEFAULT_WORKSPACE
): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("api_credentials")
    .upsert({
      workspace_id: workspaceId,
      platform,
      client_id: clientId,
      status: "pending",
    }, { onConflict: "workspace_id,platform" });
}
