"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  DatabaseZap,
  ExternalLink,
  Globe2,
  KeyRound,
  Loader2,
  Mic,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-state";
import { getApiCredentials, saveApiCredential, updateSettings, type ApiCredential } from "@/lib/actions/settings";

// ──────────────────────────────────────────────────────────────
// Plataformas de integração
// ──────────────────────────────────────────────────────────────
const PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    description: "Publicar episódios e Shorts automaticamente.",
    icon: PlayCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    docsUrl: "https://console.cloud.google.com/",
    fields: ["Client ID", "Client Secret"],
  },
  {
    id: "meta",
    name: "Meta (Instagram / Facebook)",
    description: "Agendar e publicar posts nas redes sociais.",
    icon: Globe2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    docsUrl: "https://developers.facebook.com/",
    fields: ["App ID", "App Secret"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Publicar Shorts e Reels para a audiência TikTok.",
    icon: Clapperboard,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    docsUrl: "https://developers.tiktok.com/",
    fields: ["Client Key", "Client Secret"],
  },
  {
    id: "spotify",
    name: "Spotify for Podcasters",
    description: "Sincronizar episódios e ver analytics do podcast.",
    icon: Mic,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    docsUrl: "https://developer.spotify.com/",
    fields: ["Client ID", "Client Secret"],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Activar o Assistente de IA com GPT-4.",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
    docsUrl: "https://platform.openai.com/",
    fields: ["API Key"],
  },
];

type SectionId = "perfil" | "equipa" | "tema" | "integracoes" | "api" | "backup";

// ──────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const { settings, setSettings } = useAppData();
  const [activeSection, setActiveSection] = useState<SectionId>("perfil");
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [credInputs, setCredInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getApiCredentials().then(setCredentials).catch(console.error);
  }, []);

  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    try {
      await updateSettings({
        language: settings.language,
        theme: settings.theme,
        notifications: settings.notifications,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // fallback — settings já estão no localStorage via AppProvider
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleSaveCredential = useCallback(async (platform: string, value: string) => {
    setSaving(true);
    try {
      await saveApiCredential(platform, value);
      setCredentials((prev) =>
        prev.map((c) => c.platform === platform ? { ...c, status: "pending", clientId: value } : c)
      );
      setCredInputs((prev) => ({ ...prev, [platform]: "" }));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, []);

  const getCredStatus = (platformId: string) => credentials.find((c) => c.platform === platformId);

  const navItems: Array<{ id: SectionId; label: string; icon: React.ElementType }> = [
    { id: "perfil", label: "Perfil", icon: UserRound },
    { id: "equipa", label: "Equipa", icon: Users },
    { id: "tema", label: "Aparência", icon: Palette },
    { id: "integracoes", label: "Integrações", icon: DatabaseZap },
    { id: "api", label: "Chaves de API", icon: KeyRound },
    { id: "backup", label: "Segurança", icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="space-y-2">
          <div className="brand-pill">
            <Sparkles className="h-4 w-4" />
            Configurações
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Configurações do workspace</h1>
          <p className="text-base text-muted-foreground">
            Controla o perfil, equipa, integrações de plataformas e preferências operacionais do TempCast Hub.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar de navegação */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
                {activeSection === item.id && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
              </button>
            );
          })}
        </nav>

        {/* Conteúdo principal */}
        <div className="space-y-5">

          {/* ── PERFIL ── */}
          {activeSection === "perfil" && (
            <section className="brand-card p-6">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <UserRound className="h-4 w-4 text-primary" />
                Perfil
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Nome", value: "Igor — TempCast" },
                  { label: "Função", value: "Fundador & Host" },
                  { label: "Idioma", value: "Português (Portugal)" },
                  { label: "Fuso horário", value: "Europe/Lisbon (UTC+1)" },
                  { label: "Podcast", value: "TempCast — Talento Emergente em Portugal" },
                  { label: "Workspace ID", value: "tempcast" },
                ].map((f) => (
                  <div key={f.label} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="mt-0.5 text-sm font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── EQUIPA ── */}
          {activeSection === "equipa" && (
            <section className="brand-card p-6">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Users className="h-4 w-4 text-primary" />
                Equipa
              </h2>
              <div className="mt-5 space-y-2">
                {[
                  { name: "Igor", role: "Fundador & Host", status: "Activo" },
                  { name: "Mina Ribeiro", role: "Editora", status: "Activo" },
                  { name: "Luca Martins", role: "Produção", status: "Activo" },
                  { name: "Rui Fonseca", role: "Crescimento", status: "Activo" },
                ].map((m) => (
                  <div key={m.name} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── APARÊNCIA ── */}
          {activeSection === "tema" && (
            <section className="brand-card p-6">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <Palette className="h-4 w-4 text-primary" />
                Aparência e Notificações
              </h2>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Tema</p>
                  <div className="flex gap-2">
                    {(["dark", "light", "system"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSettings((s) => ({ ...s, theme: t }))}
                        className={`rounded-2xl border px-4 py-2 text-sm font-medium capitalize transition-all ${
                          settings.theme === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/70 bg-background/70 text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {t === "dark" ? "Escuro" : t === "light" ? "Claro" : "Sistema"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Idioma</p>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
                    className="rounded-2xl border border-input bg-background/80 px-3 py-2 text-sm"
                  >
                    <option value="pt-PT">Português (Portugal)</option>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Fornecedor de IA</p>
                  <select
                    value={settings.aiProvider || "openai"}
                    onChange={(e) => setSettings((s) => ({ ...s, aiProvider: e.target.value as any }))}
                    className="rounded-2xl border border-input bg-background/80 px-3 py-2 text-sm"
                  >
                    <option value="openai">OpenAI (GPT-4)</option>
                    <option value="gemini">Google Gemini (Gemini 1.5 Pro)</option>
                    <option value="claude">Anthropic Claude (Claude 3.5 Sonnet)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Notificações</p>
                    <p className="text-xs text-muted-foreground">Alertas de produção e deadlines</p>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, notifications: !s.notifications }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        settings.notifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="btn-brand gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {saved ? "Guardado!" : "Guardar alterações"}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* ── INTEGRAÇÕES ── */}
          {activeSection === "integracoes" && (
            <section className="space-y-4">
              <div className="brand-card p-6">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <DatabaseZap className="h-4 w-4 text-primary" />
                  Integrações de Plataformas
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Conecta o TempCast Hub às plataformas de distribuição e redes sociais.
                </p>
              </div>
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const cred = getCredStatus(p.id);
                return (
                  <div key={p.id} className="brand-card p-5">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${p.bg}`}>
                        <Icon className={`h-5 w-5 ${p.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{p.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            cred?.status === "active"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : cred?.status === "pending"
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {cred?.status === "active" ? "Conectado" : cred?.status === "pending" ? "Configurado" : "Por configurar"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{p.description}</p>
                        <a
                          href={p.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          Documentação <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* ── CHAVES DE API ── */}
          {activeSection === "api" && (
            <section className="space-y-4">
              <div className="brand-card p-6">
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Chaves de API
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  As chaves são guardadas de forma segura no Supabase. Nunca são expostas ao browser.
                </p>
              </div>
              {PLATFORMS.map((p) => {
                const Icon = p.icon;
                const cred = getCredStatus(p.id);
                const inputKey = `${p.id}-key`;
                return (
                  <div key={p.id} className="brand-card p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${p.bg}`}>
                        <Icon className={`h-4 w-4 ${p.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.fields.join(", ")}</p>
                      </div>
                      {cred?.clientId && (
                        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Configurado
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder={`${p.fields[0]} de ${p.name}...`}
                        value={credInputs[inputKey] ?? ""}
                        onChange={(e) => setCredInputs((prev) => ({ ...prev, [inputKey]: e.target.value }))}
                        className="flex-1 rounded-2xl border border-input bg-background/80 px-3 py-2 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        size="sm"
                        disabled={!credInputs[inputKey] || saving}
                        onClick={() => handleSaveCredential(p.id, credInputs[inputKey] ?? "")}
                        className="btn-brand gap-1.5 text-xs px-4"
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Guardar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* ── SEGURANÇA ── */}
          {activeSection === "backup" && (
            <section className="brand-card p-6">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Segurança e Backup
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Supabase", detail: "Base de dados principal", icon: DatabaseZap, status: "Activo" },
                  { label: "Row Level Security", detail: "Isolamento de dados por workspace", icon: ShieldCheck, status: "Activo" },
                  { label: "Backup automático", detail: "Supabase Point-in-Time Recovery", icon: BellRing, status: "Configurar" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === "Activo"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
