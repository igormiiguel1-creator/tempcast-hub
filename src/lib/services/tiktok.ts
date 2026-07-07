/**
 * TempCast Hub — TikTok Integration Service
 * Módulo de integração com TikTok for Developers API
 */

export interface TikTokConfig {
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  openId?: string;
}

export interface TikTokVideoData {
  title: string;
  description: string;
  privacyLevel: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
  disableComment?: boolean;
  disableDuet?: boolean;
  disableStitch?: boolean;
  brandContentToggle?: boolean;
  scheduleTime?: number; // Unix timestamp
}

// ──────────────────────────────────────────────────────────────
// OAuth 2.0 (TikTok Login Kit)
// ──────────────────────────────────────────────────────────────

export function getTikTokAuthUrl(clientKey: string, redirectUri: string): string {
  const csrfState = Math.random().toString(36).slice(2);
  const params = new URLSearchParams({
    client_key: clientKey,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user.info.basic,video.publish,video.upload",
    state: csrfState,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export async function exchangeTikTokCode(
  code: string,
  config: TikTokConfig
): Promise<{
  accessToken: string;
  refreshToken: string;
  openId: string;
  expiresIn: number;
}> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
  });

  if (!res.ok) throw new Error(`Erro na autenticação TikTok: ${res.statusText}`);
  const data = await res.json() as {
    data: {
      access_token: string;
      refresh_token: string;
      open_id: string;
      expires_in: number;
    };
  };

  return {
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token,
    openId: data.data.open_id,
    expiresIn: data.data.expires_in,
  };
}

export async function refreshTikTokToken(
  refreshToken: string,
  config: Pick<TikTokConfig, "clientKey" | "clientSecret">
): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error("Erro a renovar token TikTok");
  const data = await res.json() as { data: { access_token: string; expires_in: number } };
  return {
    accessToken: data.data.access_token,
    expiresIn: data.data.expires_in,
  };
}

// ──────────────────────────────────────────────────────────────
// TikTok Content Posting API
// ──────────────────────────────────────────────────────────────

export async function getTikTokUserInfo(
  accessToken: string,
  openId: string
): Promise<{ displayName: string; avatarUrl: string; followerCount: number }> {
  const res = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url,follower_count`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) return { displayName: openId, avatarUrl: "", followerCount: 0 };
  const data = await res.json() as {
    data: { user: { display_name: string; avatar_url: string; follower_count: number } };
  };

  return {
    displayName: data.data.user.display_name,
    avatarUrl: data.data.user.avatar_url,
    followerCount: data.data.user.follower_count,
  };
}

export async function initTikTokVideoUpload(
  videoData: TikTokVideoData,
  fileSizeBytes: number,
  chunkSize: number,
  accessToken: string
): Promise<{ publishId: string; uploadUrl: string }> {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: videoData.title,
          description: videoData.description,
          privacy_level: videoData.privacyLevel,
          disable_comment: videoData.disableComment ?? false,
          disable_duet: videoData.disableDuet ?? false,
          disable_stitch: videoData.disableStitch ?? false,
          ...(videoData.scheduleTime ? { schedule_time: videoData.scheduleTime } : {}),
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: fileSizeBytes,
          chunk_size: chunkSize,
          total_chunk_count: Math.ceil(fileSizeBytes / chunkSize),
        },
      }),
    }
  );

  if (!res.ok) throw new Error("Erro a inicializar upload TikTok");
  const data = await res.json() as { data: { publish_id: string; upload_url: string } };
  return {
    publishId: data.data.publish_id,
    uploadUrl: data.data.upload_url,
  };
}
