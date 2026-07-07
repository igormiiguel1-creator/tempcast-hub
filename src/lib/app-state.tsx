"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  episodes as initialEpisodes,
  calendarEvents as initialCalendarEvents,
  roadmapCards as initialRoadmapCards,
  tasks as initialTasks,
  socialPosts as initialSocialPosts,
  partners as initialPartners,
  libraryAssets as initialLibraryAssets,
  reports as initialReports,
  financeEntries as initialFinanceEntries,
  aiPrompts,
  integrations,
} from "@/features/production/mock-data";
import { guests as initialGuests } from "@/features/convidados/mock-data";
import type {
  CalendarEvent,
  Episode,
  FinanceEntry,
  LibraryAsset,
  Partner,
  ReportItem,
  RoadmapCard,
  SocialPost,
  TaskItem,
} from "@/features/production/types";
import type { Guest } from "@/features/convidados/types";

// Server Actions (importadas dinamicamente para serem chamadas do cliente)
import { getEpisodes, createEpisode as saCreateEpisode, updateEpisode as saUpdateEpisode, deleteEpisode as saDeleteEpisode } from "@/lib/actions/episodes";
import { getGuests, createGuest as saCreateGuest, updateGuest as saUpdateGuest, deleteGuest as saDeleteGuest, toggleGuestFavorite as saToggleFavorite } from "@/lib/actions/guests";
import { getTasks, createTask as saCreateTask, updateTask as saUpdateTask, toggleTaskComplete as saToggleTask, moveTask as saMoveTask } from "@/lib/actions/tasks";
import { getCalendarEvents, addCalendarEvent as saAddEvent, updateCalendarEvent as saUpdateEvent } from "@/lib/actions/calendar";
import { getRoadmapCards, updateRoadmapCard as saUpdateCard, completeRoadmapCard as saCompleteCard } from "@/lib/actions/roadmap";
import { getSocialPosts, createSocialPost as saCreatePost, updateSocialPost as saUpdatePost } from "@/lib/actions/social";
import { getPartners, createPartner as saCreatePartner, updatePartner as saUpdatePartner } from "@/lib/actions/partners";
import { getLibraryAssets, addLibraryAsset as saAddAsset } from "@/lib/actions/library";
import { getFinanceEntries, createFinanceEntry as saCreateFinance, updateFinanceEntry as saUpdateFinance, deleteFinanceEntry as saDeleteFinance } from "@/lib/actions/finance";

export interface AppSettings {
  language: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
  aiProvider?: "openai" | "gemini" | "claude";
}

export interface GlobalSearchResult {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  href: string;
}

interface AppContextValue {
  episodes: Episode[];
  setEpisodes: Dispatch<SetStateAction<Episode[]>>;
  guests: Guest[];
  setGuests: Dispatch<SetStateAction<Guest[]>>;
  calendarEvents: CalendarEvent[];
  setCalendarEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
  tasks: TaskItem[];
  setTasks: Dispatch<SetStateAction<TaskItem[]>>;
  roadmapCards: RoadmapCard[];
  setRoadmapCards: Dispatch<SetStateAction<RoadmapCard[]>>;
  socialPosts: SocialPost[];
  setSocialPosts: Dispatch<SetStateAction<SocialPost[]>>;
  partners: Partner[];
  setPartners: Dispatch<SetStateAction<Partner[]>>;
  libraryAssets: LibraryAsset[];
  setLibraryAssets: Dispatch<SetStateAction<LibraryAsset[]>>;
  reports: ReportItem[];
  setReports: Dispatch<SetStateAction<ReportItem[]>>;
  financeEntries: FinanceEntry[];
  setFinanceEntries: Dispatch<SetStateAction<FinanceEntry[]>>;
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: Dispatch<SetStateAction<boolean>>;
  globalSearchResults: GlobalSearchResult[];
  aiPrompts: typeof aiPrompts;
  integrations: typeof integrations;
  isLoading: boolean;
  // CRUD — Episódios
  createEpisode: (input: Omit<Episode, "id">) => Promise<void>;
  updateEpisode: (id: number, updates: Partial<Episode>) => Promise<void>;
  deleteEpisode: (id: number) => void;
  archiveEpisode: (id: number) => void;
  duplicateEpisode: (id: number) => void;
  // CRUD — Convidados
  createGuest: (input: Omit<Guest, "id">) => Promise<void>;
  updateGuest: (id: number, updates: Partial<Guest>) => Promise<void>;
  deleteGuest: (id: number) => void;
  toggleGuestFavorite: (id: number) => void;
  // CRUD — Calendário
  addCalendarEvent: (input: Omit<CalendarEvent, "id">) => void;
  updateCalendarEvent: (id: number, updates: Partial<CalendarEvent>) => void;
  // CRUD — Tarefas
  createTask: (input: Omit<TaskItem, "id">) => Promise<void>;
  updateTask: (id: number, updates: Partial<TaskItem>) => void;
  toggleTaskComplete: (id: number) => void;
  moveTask: (id: number, section: TaskItem["section"]) => void;
  // CRUD — Roadmap
  updateRoadmapCard: (id: number, updates: Partial<RoadmapCard>) => void;
  completeRoadmapCard: (id: number) => void;
  // CRUD — Social
  createSocialPost: (input: Omit<SocialPost, "id">) => void;
  updateSocialPost: (id: number, updates: Partial<SocialPost>) => void;
  // CRUD — Parceiros
  createPartner: (input: Omit<Partner, "id">) => void;
  updatePartner: (id: number, updates: Partial<Partner>) => void;
  // CRUD — Biblioteca
  addLibraryAsset: (input: Omit<LibraryAsset, "id">) => void;
  // CRUD — Finanças
  createFinanceEntry: (input: Omit<FinanceEntry, "id">) => void;
  updateFinanceEntry: (id: number, updates: Partial<FinanceEntry>) => void;
  deleteFinanceEntry: (id: number) => void;
  generatePreview: (type: string) => string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);
const SETTINGS_STORAGE_KEY = "tempcast-hub-settings";

function normalizeTheme(theme: string): AppSettings["theme"] {
  if (theme === "light" || theme === "dark" || theme === "system") return theme;
  return "dark";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(initialCalendarEvents);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [roadmapCards, setRoadmapCards] = useState<RoadmapCard[]>(initialRoadmapCards);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(initialSocialPosts);
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [libraryAssets, setLibraryAssets] = useState<LibraryAsset[]>(initialLibraryAssets);
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(initialFinanceEntries);
  const [settings, setSettings] = useState<AppSettings>({
    language: "pt-PT",
    theme: "dark",
    notifications: true,
    aiProvider: "openai",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Carregar settings do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AppSettings;
      setSettings({
        language: parsed.language ?? "pt-PT",
        theme: normalizeTheme(parsed.theme ?? "dark"),
        notifications: parsed.notifications ?? true,
        aiProvider: parsed.aiProvider ?? "openai",
      });
    } catch {
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  }, []);

  // Persistir settings
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Carregar dados do Supabase (ou manter mock como fallback)
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [
          eps, gst, evts, tsk, rdmp, soc, prtn, lib, fin,
        ] = await Promise.all([
          getEpisodes(),
          getGuests(),
          getCalendarEvents(),
          getTasks(),
          getRoadmapCards(),
          getSocialPosts(),
          getPartners(),
          getLibraryAssets(),
          getFinanceEntries(),
        ]);

        if (!mounted) return;
        setEpisodes(eps);
        setGuests(gst);
        setCalendarEvents(evts);
        setTasks(tsk);
        setRoadmapCards(rdmp);
        setSocialPosts(soc);
        setPartners(prtn);
        setLibraryAssets(lib);
        setFinanceEntries(fin);
      } catch (err) {
        console.warn("[TempCast] Usando dados mock — Supabase não configurado.", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []);

  // ── CRUD — Episódios ──────────────────────────────────────
  const createEpisode = useCallback(async (input: Omit<Episode, "id">) => {
    const optimistic: Episode = { ...input, id: Date.now() };
    setEpisodes((cur) => [optimistic, ...cur]);
    try {
      const created = await saCreateEpisode(input);
      setEpisodes((cur) => cur.map((e) => (e.id === optimistic.id ? created : e)));
    } catch {
      setEpisodes((cur) => cur.filter((e) => e.id !== optimistic.id));
    }
  }, []);

  const updateEpisode = useCallback(async (id: number, updates: Partial<Episode>) => {
    setEpisodes((cur) => cur.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    await saUpdateEpisode(id, updates);
  }, []);

  const deleteEpisode = useCallback((id: number) => {
    setEpisodes((cur) => cur.filter((e) => e.id !== id));
    saDeleteEpisode(id).catch(console.error);
  }, []);

  const archiveEpisode = useCallback((id: number) => {
    updateEpisode(id, { status: "Published" });
  }, [updateEpisode]);

  const duplicateEpisode = useCallback((id: number) => {
    const source = episodes.find((e) => e.id === id);
    if (!source) return;
    createEpisode({ ...source, title: `${source.title} (cópia)` });
  }, [episodes, createEpisode]);

  // ── CRUD — Convidados ──────────────────────────────────────
  const createGuest = useCallback(async (input: Omit<Guest, "id">) => {
    const optimistic: Guest = { ...input, id: Date.now() };
    setGuests((cur) => [optimistic, ...cur]);
    try {
      const created = await saCreateGuest(input);
      setGuests((cur) => cur.map((g) => (g.id === optimistic.id ? created : g)));
    } catch {
      setGuests((cur) => cur.filter((g) => g.id !== optimistic.id));
    }
  }, []);

  const updateGuest = useCallback(async (id: number, updates: Partial<Guest>) => {
    setGuests((cur) => cur.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    await saUpdateGuest(id, updates);
  }, []);

  const deleteGuest = useCallback((id: number) => {
    setGuests((cur) => cur.filter((g) => g.id !== id));
    saDeleteGuest(id).catch(console.error);
  }, []);

  const toggleGuestFavorite = useCallback((id: number) => {
    const guest = guests.find((g) => g.id === id);
    if (!guest) return;
    setGuests((cur) => cur.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)));
    saToggleFavorite(id, guest.favorite).catch(console.error);
  }, [guests]);

  // ── CRUD — Calendário ──────────────────────────────────────
  const addCalendarEvent = useCallback((input: Omit<CalendarEvent, "id">) => {
    setCalendarEvents((cur) => [{ ...input, id: Date.now() }, ...cur]);
    saAddEvent(input).catch(console.error);
  }, []);

  const updateCalendarEvent = useCallback((id: number, updates: Partial<CalendarEvent>) => {
    setCalendarEvents((cur) => cur.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    saUpdateEvent(id, updates).catch(console.error);
  }, []);

  // ── CRUD — Tarefas ─────────────────────────────────────────
  const createTask = useCallback(async (input: Omit<TaskItem, "id">) => {
    const optimistic: TaskItem = { ...input, id: Date.now() };
    setTasks((cur) => [optimistic, ...cur]);
    try {
      const created = await saCreateTask(input);
      setTasks((cur) => cur.map((t) => (t.id === optimistic.id ? created : t)));
    } catch {
      setTasks((cur) => cur.filter((t) => t.id !== optimistic.id));
    }
  }, []);

  const updateTask = useCallback((id: number, updates: Partial<TaskItem>) => {
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    saUpdateTask(id, updates).catch(console.error);
  }, []);

  const toggleTaskComplete = useCallback((id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newSection: TaskItem["section"] = task.section === "Completed" ? "Today" : "Completed";
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, section: newSection } : t)));
    saToggleTask(id, task.section).catch(console.error);
  }, [tasks]);

  const moveTask = useCallback((id: number, section: TaskItem["section"]) => {
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, section } : t)));
    saMoveTask(id, section).catch(console.error);
  }, []);

  // ── CRUD — Roadmap ─────────────────────────────────────────
  const updateRoadmapCard = useCallback((id: number, updates: Partial<RoadmapCard>) => {
    setRoadmapCards((cur) => cur.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    saUpdateCard(id, updates).catch(console.error);
  }, []);

  const completeRoadmapCard = useCallback((id: number) => {
    setRoadmapCards((cur) => cur.map((c) => (c.id === id ? { ...c, progress: 100, stage: "Published" } : c)));
    saCompleteCard(id).catch(console.error);
  }, []);

  // ── CRUD — Social ──────────────────────────────────────────
  const createSocialPost = useCallback((input: Omit<SocialPost, "id">) => {
    setSocialPosts((cur) => [{ ...input, id: Date.now() }, ...cur]);
    saCreatePost(input).catch(console.error);
  }, []);

  const updateSocialPost = useCallback((id: number, updates: Partial<SocialPost>) => {
    setSocialPosts((cur) => cur.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    saUpdatePost(id, updates).catch(console.error);
  }, []);

  // ── CRUD — Parceiros ───────────────────────────────────────
  const createPartner = useCallback((input: Omit<Partner, "id">) => {
    setPartners((cur) => [{ ...input, id: Date.now() }, ...cur]);
    saCreatePartner(input).catch(console.error);
  }, []);

  const updatePartner = useCallback((id: number, updates: Partial<Partner>) => {
    setPartners((cur) => cur.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    saUpdatePartner(id, updates).catch(console.error);
  }, []);

  // ── CRUD — Biblioteca ──────────────────────────────────────
  const addLibraryAsset = useCallback((input: Omit<LibraryAsset, "id">) => {
    setLibraryAssets((cur) => [{ ...input, id: Date.now() }, ...cur]);
    saAddAsset(input).catch(console.error);
  }, []);

  // ── CRUD — Finanças ────────────────────────────────────────
  const createFinanceEntry = useCallback((input: Omit<FinanceEntry, "id">) => {
    setFinanceEntries((cur) => [{ ...input, id: Date.now() }, ...cur]);
    saCreateFinance(input).catch(console.error);
  }, []);

  const updateFinanceEntry = useCallback((id: number, updates: Partial<FinanceEntry>) => {
    setFinanceEntries((cur) => cur.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    saUpdateFinance(id, updates).catch(console.error);
  }, []);

  const deleteFinanceEntry = useCallback((id: number) => {
    setFinanceEntries((cur) => cur.filter((e) => e.id !== id));
    saDeleteFinance(id).catch(console.error);
  }, []);

  // ── Pesquisa Global ────────────────────────────────────────
  const globalSearchResults = useMemo<GlobalSearchResult[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const results: GlobalSearchResult[] = [];
    const push = (category: string, title: string, subtitle: string, href: string) => {
      if (title.toLowerCase().includes(query) || subtitle.toLowerCase().includes(query)) {
        results.push({ id: `${category}-${title}`, category, title, subtitle, href });
      }
    };

    guests.forEach((g) => push("Convidados", g.name, `${g.company} · ${g.status}`, "/convidados"));
    episodes.forEach((e) => push("Episódios", e.title, `${e.guest} · ${e.status}`, "/episodios"));
    financeEntries.forEach((f) => push("Finanças", f.title, `${f.type} · ${f.amount}`, "/relatorios"));
    libraryAssets.forEach((a) => push("Biblioteca", a.title, `${a.type} · ${a.category}`, "/biblioteca"));
    partners.forEach((p) => push("Parceiros", p.name, p.contact, "/parceiros"));
    calendarEvents.forEach((c) => push("Calendário", c.title, `${c.date} · ${c.time}`, "/calendario"));
    tasks.forEach((t) => push("Tarefas", t.title, `${t.assignee} · ${t.dueDate}`, "/tarefas"));

    return results.slice(0, 8);
  }, [calendarEvents, episodes, financeEntries, guests, libraryAssets, partners, searchQuery, tasks]);

  const generatePreview = useCallback((type: string) => {
    if (type === "PDF") return "Pré-visualização PDF gerada para a selecção actual.";
    if (type === "Excel") return "Pré-visualização Excel gerada com as últimas métricas.";
    return `Pré-visualização gerada para ${type}`;
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    episodes, setEpisodes,
    guests, setGuests,
    calendarEvents, setCalendarEvents,
    tasks, setTasks,
    roadmapCards, setRoadmapCards,
    socialPosts, setSocialPosts,
    partners, setPartners,
    libraryAssets, setLibraryAssets,
    reports, setReports,
    financeEntries, setFinanceEntries,
    settings, setSettings,
    searchQuery, setSearchQuery,
    commandPaletteOpen, setCommandPaletteOpen,
    globalSearchResults,
    aiPrompts,
    integrations,
    isLoading,
    createEpisode, updateEpisode, deleteEpisode, archiveEpisode, duplicateEpisode,
    createGuest, updateGuest, deleteGuest, toggleGuestFavorite,
    addCalendarEvent, updateCalendarEvent,
    createTask, updateTask, toggleTaskComplete, moveTask,
    updateRoadmapCard, completeRoadmapCard,
    createSocialPost, updateSocialPost,
    createPartner, updatePartner,
    addLibraryAsset,
    createFinanceEntry, updateFinanceEntry, deleteFinanceEntry,
    generatePreview,
  }), [
    episodes, guests, calendarEvents, tasks, roadmapCards, socialPosts,
    partners, libraryAssets, reports, financeEntries, settings,
    searchQuery, commandPaletteOpen, globalSearchResults, isLoading,
    createEpisode, updateEpisode, deleteEpisode, archiveEpisode, duplicateEpisode,
    createGuest, updateGuest, deleteGuest, toggleGuestFavorite,
    addCalendarEvent, updateCalendarEvent,
    createTask, updateTask, toggleTaskComplete, moveTask,
    updateRoadmapCard, completeRoadmapCard,
    createSocialPost, updateSocialPost,
    createPartner, updatePartner,
    addLibraryAsset,
    createFinanceEntry, updateFinanceEntry, deleteFinanceEntry,
    generatePreview,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData deve ser usado dentro de AppProvider");
  }
  return context;
}
