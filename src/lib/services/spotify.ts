/**
 * TempCast Hub — Spotify Integration Service
 * Módulo de integração com Spotify API (Podcast/Shows)
 */

export interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface SpotifyEpisodeData {
  name: string;
  description: string;
  explicit: boolean;
  releaseDate?: string;
  audioFileUrl: string;
  coverImageUrl?: string;
  languages?: string[];
}

// ──────────────────────────────────────────────────────────────
// OAuth 2.0 Authorization Code Flow with PKCE
// ──────────────────────────────────────────────────────────────

export function getSpotifyAuthUrl(clientId: string, redirectUri: string, codeVerifier: string): string {
  // Em produção: usar PKCE com code_challenge sha256(code_verifier)
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: [
      "user-read-private",
      "user-read-email",
      "ugc-image-upload",
    ].join(" "),
    code_challenge_method: "S256",
    code_challenge: codeVerifier, // Em produção: hash SHA256 do verifier
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCode(
  code: string,
  config: SpotifyConfig,
  codeVerifier: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) throw new Error(`Erro na autenticação Spotify: ${res.statusText}`);
  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshSpotifyToken(
  refreshToken: string,
  config: Pick<SpotifyConfig, "clientId">
): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.clientId,
    }),
  });

  if (!res.ok) throw new Error("Erro a renovar token Spotify");
  const data = await res.json() as { access_token: string; expires_in: number };
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

// ──────────────────────────────────────────────────────────────
// Spotify Web API
// ──────────────────────────────────────────────────────────────

export async function getSpotifyUserProfile(accessToken: string): Promise<{
  id: string;
  displayName: string;
  email: string;
  country: string;
  product: string;
}> {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Erro a obter perfil Spotify");
  const data = await res.json() as { id: string; display_name: string; email: string; country: string; product: string };
  return {
    id: data.id,
    displayName: data.display_name,
    email: data.email,
    country: data.country,
    product: data.product,
  };
}

// ──────────────────────────────────────────────────────────────
// Spotify for Podcasters (Anchor API — beta)
// Note: A API pública de podcasts do Spotify é limitada.
// O upload de episódios é feito via Spotify for Podcasters dashboard
// ou via RSS feed. Esta função fornece o helper de RSS.
// ──────────────────────────────────────────────────────────────

export function generateRSSFeed(showInfo: {
  title: string;
  description: string;
  author: string;
  email: string;
  language: string;
  imageUrl: string;
  episodes: Array<{
    title: string;
    description: string;
    pubDate: string;
    audioUrl: string;
    duration: string;
    episodeNumber: number;
    explicit: boolean;
  }>;
}): string {
  const items = showInfo.episodes.map((ep) => `
    <item>
      <title><![CDATA[${ep.title}]]></title>
      <description><![CDATA[${ep.description}]]></description>
      <pubDate>${ep.pubDate}</pubDate>
      <enclosure url="${ep.audioUrl}" type="audio/mpeg" />
      <itunes:duration>${ep.duration}</itunes:duration>
      <itunes:episode>${ep.episodeNumber}</itunes:episode>
      <itunes:explicit>${ep.explicit ? "yes" : "no"}</itunes:explicit>
      <guid isPermaLink="false">${ep.audioUrl}</guid>
    </item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${showInfo.title}]]></title>
    <description><![CDATA[${showInfo.description}]]></description>
    <language>${showInfo.language}</language>
    <itunes:author>${showInfo.author}</itunes:author>
    <itunes:owner>
      <itunes:email>${showInfo.email}</itunes:email>
    </itunes:owner>
    <itunes:image href="${showInfo.imageUrl}" />
    <itunes:explicit>no</itunes:explicit>
    ${items}
  </channel>
</rss>`;
}

export async function getSpotifyShowAnalytics(
  accessToken: string,
  showId: string
): Promise<{ starts: number; streams: number; listeners: number; followers: number } | null> {
  // Note: Analytics requer Spotify for Podcasters API (acesso limitado)
  // Esta é uma implementação de stub para quando o acesso estiver disponível
  const res = await fetch(
    `https://api.spotify.com/v1/shows/${showId}?market=PT`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) return null;

  // A API pública não retorna analytics detalhadas
  // Retorna dados básicos do show
  return { starts: 0, streams: 0, listeners: 0, followers: 0 };
}
