/**
 * TempCast Hub — YouTube Integration Service
 * Módulo de integração com a YouTube Data API v3 e YouTube Analytics API
 */

export interface YouTubeConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface YouTubeVideoStats {
  videoId: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  averageViewDuration: number;
  estimatedMinutesWatched: number;
}

export interface YouTubeUploadData {
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
  privacyStatus: "public" | "private" | "unlisted";
  scheduledPublishAt?: string;
}

// ──────────────────────────────────────────────────────────────
// OAuth 2.0
// ──────────────────────────────────────────────────────────────

export function getYouTubeAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeYouTubeCode(
  code: string,
  config: YouTubeConfig
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) throw new Error(`Erro na troca de código YouTube: ${res.statusText}`);
  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshYouTubeToken(
  refreshToken: string,
  config: Pick<YouTubeConfig, "clientId" | "clientSecret">
): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error(`Erro a renovar token YouTube: ${res.statusText}`);
  const data = await res.json() as { access_token: string; expires_in: number };
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

// ──────────────────────────────────────────────────────────────
// YouTube Data API
// ──────────────────────────────────────────────────────────────

export async function getYouTubeChannelInfo(accessToken: string): Promise<{
  id: string;
  title: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}> {
  const res = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error("Erro a obter canal YouTube");
  const data = await res.json() as { items: { id: string; snippet: { title: string }; statistics: { subscriberCount: string; videoCount: string; viewCount: string } }[] };
  const channel = data.items[0];
  return {
    id: channel.id,
    title: channel.snippet.title,
    subscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
    videoCount: parseInt(channel.statistics.videoCount || "0"),
    viewCount: parseInt(channel.statistics.viewCount || "0"),
  };
}

export async function getYouTubeRecentVideos(
  accessToken: string,
  maxResults = 10
): Promise<Array<{ id: string; title: string; publishedAt: string; viewCount: number }>> {
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=date&maxResults=${maxResults}&forMine=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!searchRes.ok) return [];
  const searchData = await searchRes.json() as { items: { id: { videoId: string }; snippet: { title: string; publishedAt: string } }[] };

  const videoIds = searchData.items.map((v) => v.id.videoId).join(",");
  const statsRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const statsData = await statsRes.json() as { items: { id: string; statistics: { viewCount: string } }[] };
  const statsMap = new Map(statsData.items.map((v) => [v.id, v.statistics]));

  return searchData.items.map((v) => ({
    id: v.id.videoId,
    title: v.snippet.title,
    publishedAt: v.snippet.publishedAt,
    viewCount: parseInt(statsMap.get(v.id.videoId)?.viewCount || "0"),
  }));
}

// ──────────────────────────────────────────────────────────────
// Upload de vídeo (stub — requer multipart upload em produção)
// ──────────────────────────────────────────────────────────────

export function buildYouTubeVideoMetadata(data: YouTubeUploadData): Record<string, unknown> {
  return {
    snippet: {
      title: data.title,
      description: data.description,
      tags: data.tags,
      categoryId: data.categoryId || "22", // 22 = People & Blogs
    },
    status: {
      privacyStatus: data.privacyStatus,
      ...(data.scheduledPublishAt ? { publishAt: data.scheduledPublishAt } : {}),
    },
  };
}
