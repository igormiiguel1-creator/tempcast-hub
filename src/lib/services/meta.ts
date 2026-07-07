/**
 * TempCast Hub — Meta Integration Service
 * Módulo de integração com Meta Graph API (Instagram + Facebook)
 */

export interface MetaConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  accessToken?: string;
  pageId?: string;
  instagramAccountId?: string;
}

export interface MetaPostData {
  message: string;
  imageUrl?: string;
  scheduledPublishTime?: number; // Unix timestamp
  published?: boolean;
}

export interface InstagramMediaData {
  imageUrl?: string;
  videoUrl?: string;
  caption: string;
  mediaType: "IMAGE" | "VIDEO" | "REELS" | "STORIES" | "CAROUSEL_ALBUM";
  scheduledPublishTime?: number;
}

// ──────────────────────────────────────────────────────────────
// OAuth
// ──────────────────────────────────────────────────────────────

export function getMetaAuthUrl(appId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: [
      "pages_manage_posts",
      "pages_read_engagement",
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_insights",
      "pages_show_list",
    ].join(","),
    response_type: "code",
  });
  return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeMetaCode(
  code: string,
  config: MetaConfig
): Promise<{ accessToken: string; tokenType: string }> {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: config.appId,
      redirect_uri: config.redirectUri,
      client_secret: config.appSecret,
      code,
    })
  );
  if (!res.ok) throw new Error(`Erro na troca de código Meta: ${res.statusText}`);
  const data = await res.json() as { access_token: string; token_type: string };
  return { accessToken: data.access_token, tokenType: data.token_type };
}

export async function getLongLivedToken(
  shortToken: string,
  config: Pick<MetaConfig, "appId" | "appSecret">
): Promise<string> {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/oauth/access_token?` +
    new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: config.appId,
      client_secret: config.appSecret,
      fb_exchange_token: shortToken,
    })
  );
  if (!res.ok) throw new Error("Erro a obter long-lived token Meta");
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// ──────────────────────────────────────────────────────────────
// Instagram Graph API
// ──────────────────────────────────────────────────────────────

export async function getInstagramAccountId(
  accessToken: string,
  pageId: string
): Promise<string> {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`
  );
  if (!res.ok) throw new Error("Erro a obter conta Instagram");
  const data = await res.json() as { instagram_business_account: { id: string } };
  return data.instagram_business_account.id;
}

export async function createInstagramMediaContainer(
  igAccountId: string,
  mediaData: InstagramMediaData,
  accessToken: string
): Promise<string> {
  const params: Record<string, string> = {
    access_token: accessToken,
    caption: mediaData.caption,
    media_type: mediaData.mediaType,
  };

  if (mediaData.imageUrl) params.image_url = mediaData.imageUrl;
  if (mediaData.videoUrl) params.video_url = mediaData.videoUrl;
  if (mediaData.scheduledPublishTime) {
    params.published = "false";
    params.scheduled_publish_time = mediaData.scheduledPublishTime.toString();
  }

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${igAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }
  );
  if (!res.ok) throw new Error("Erro a criar container de media Instagram");
  const data = await res.json() as { id: string };
  return data.id;
}

export async function publishInstagramMedia(
  igAccountId: string,
  containerId: string,
  accessToken: string
): Promise<string> {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${igAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: containerId, access_token: accessToken }),
    }
  );
  if (!res.ok) throw new Error("Erro a publicar no Instagram");
  const data = await res.json() as { id: string };
  return data.id;
}

export async function getInstagramInsights(
  igAccountId: string,
  accessToken: string,
  period: "day" | "week" | "month" = "week"
): Promise<{ followers: number; reach: number; impressions: number; profileViews: number }> {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${igAccountId}/insights?` +
    new URLSearchParams({
      metric: "follower_count,reach,impressions,profile_views",
      period,
      access_token: accessToken,
    })
  );
  if (!res.ok) return { followers: 0, reach: 0, impressions: 0, profileViews: 0 };
  const data = await res.json() as { data: { name: string; values: { value: number }[] }[] };

  const getValue = (name: string) => {
    const metric = data.data.find((d) => d.name === name);
    return metric?.values[metric.values.length - 1]?.value ?? 0;
  };

  return {
    followers: getValue("follower_count"),
    reach: getValue("reach"),
    impressions: getValue("impressions"),
    profileViews: getValue("profile_views"),
  };
}
