"use server";

import { createClient } from "@supabase/supabase-js";
import { socialPosts as mockPosts } from "@/features/production/mock-data";
import type { SocialPost } from "@/features/production/types";

const DEFAULT_WORKSPACE = "00000000-0000-0000-0000-000000000001";

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("xxxxxxxxxxxx")) return null;
  return createClient(url, key);
}

function dbToPost(row: any): SocialPost {
  return {
    id: row.id,
    platform: row.platform,
    status: row.status,
    content: row.content,
    scheduledFor: row.scheduled_for ?? "",
    audience: row.audience ?? "",
    performance: row.performance ?? "",
    tags: row.tags ?? [],
  };
}

export async function getSocialPosts(workspaceId = DEFAULT_WORKSPACE): Promise<SocialPost[]> {
  const supabase = getServerClient();
  if (!supabase) return mockPosts;

  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) return mockPosts;
  return data.map(dbToPost);
}

export async function createSocialPost(input: Omit<SocialPost, "id">, workspaceId = DEFAULT_WORKSPACE): Promise<SocialPost> {
  const supabase = getServerClient();
  if (!supabase) return { ...input, id: Date.now() };

  // check valid platform values
  let platformVal = input.platform;
  if (platformVal !== "Instagram" && platformVal !== "YouTube" && platformVal !== "TikTok" && platformVal !== "LinkedIn" && platformVal !== "Spotify" && platformVal !== "Twitter" && platformVal !== "Facebook") {
    platformVal = "Instagram";
  }

  const { data, error } = await supabase
    .from("social_posts")
    .insert({
      workspace_id: workspaceId,
      platform: platformVal,
      status: input.status,
      content: input.content,
      scheduled_for: input.scheduledFor || null,
      audience: input.audience || null,
      performance: input.performance || null,
      tags: input.tags ?? [],
    })
    .select()
    .single();

  if (error || !data) return { ...input, id: Date.now() };
  return dbToPost(data);
}

export async function updateSocialPost(id: number, updates: Partial<SocialPost>, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.content !== undefined) dbUpdates.content = updates.content;
  if (updates.scheduledFor !== undefined) dbUpdates.scheduled_for = updates.scheduledFor;
  if (updates.audience !== undefined) dbUpdates.audience = updates.audience;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

  await supabase
    .from("social_posts")
    .update(dbUpdates)
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}

export async function deleteSocialPost(id: number, workspaceId = DEFAULT_WORKSPACE): Promise<void> {
  const supabase = getServerClient();
  if (!supabase) return;

  await supabase
    .from("social_posts")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);
}
