export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EpisodeRow {
  id: number;
  workspace_id: string;
  title: string;
  guest: string | null;
  editor: string | null;
  sponsor: string | null;
  status: string;
  recording_date: string | null;
  editing_date: string | null;
  publication_date: string | null;
  priority: string;
  duration: string | null;
  platform_status: string | null;
  overview: string | null;
  notes: string | null;
  sponsors: string[];
  checklist: Json;
  files: Json;
  timeline: Json;
  recent_activity: Json;
  attachments: string[];
  created_at: string;
  updated_at: string;
  archived: boolean;
}

export interface GuestRow {
  id: number;
  workspace_id: string;
  name: string;
  profession: string | null;
  company: string | null;
  status: string;
  priority: string;
  favorite: boolean;
  recording_date: string | null;
  publication_date: string | null;
  biography: string | null;
  notes: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  linkedin: string | null;
  website: string | null;
  contact_date: string | null;
  confirmation_date: string | null;
  editing_date: string | null;
  recent_activity: Json;
  expenses: Json;
  checklist: Json;
  attachments: string[];
  timeline: Json;
  initials: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: number;
  workspace_id: string;
  title: string;
  description: string | null;
  priority: string;
  assignee: string | null;
  due_date: string | null;
  section: string;
  episode: string | null;
  guest: string | null;
  checklist: Json;
  comments: string[];
  attachments: string[];
  activity: Json;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventRow {
  id: number;
  workspace_id: string;
  title: string;
  type: string;
  date: string;
  time: string | null;
  location: string | null;
  summary: string | null;
  accent: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapCardRow {
  id: number;
  workspace_id: string;
  title: string;
  stage: string;
  priority: string;
  tags: string[];
  guest: string | null;
  episode: string | null;
  due_date: string | null;
  progress: number;
  checklist_preview: string[];
  created_at: string;
  updated_at: string;
}

export interface SocialPostRow {
  id: number;
  workspace_id: string;
  platform: string;
  status: string;
  content: string;
  scheduled_for: string | null;
  audience: string | null;
  performance: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PartnerRow {
  id: number;
  workspace_id: string;
  name: string;
  type: string;
  status: string;
  contract_value: string | null;
  next_meeting: string | null;
  notes: string | null;
  contact: string | null;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LibraryAssetRow {
  id: number;
  workspace_id: string;
  title: string;
  type: string;
  category: string | null;
  size: string | null;
  updated_at: string;
  tag: string | null;
  url: string | null;
  created_at: string;
}

export interface FinanceEntryRow {
  id: number;
  workspace_id: string;
  title: string;
  type: string;
  category: string | null;
  amount: string;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsRow {
  id: string;
  workspace_id: string;
  key: string;
  value: Json;
  updated_at: string;
}

export interface ApiCredentialRow {
  id: string;
  workspace_id: string;
  platform: "youtube" | "meta" | "tiktok" | "spotify" | "openai" | "anthropic";
  client_id: string | null;
  client_secret_encrypted: string | null;
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  expires_at: string | null;
  scope: string | null;
  status: "pending" | "active" | "error" | "expired";
  created_at: string;
  updated_at: string;
}

export interface AIConversationRow {
  id: string;
  workspace_id: string;
  title: string | null;
  messages: Json;
  created_at: string;
  updated_at: string;
}

export interface EquipmentRow {
  id: number;
  workspace_id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  serial: string | null;
  status: string;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: WorkspaceRow;
        Insert: { [K in Exclude<keyof WorkspaceRow, "id" | "created_at" | "updated_at">]: WorkspaceRow[K] };
        Update: { [K in Exclude<keyof WorkspaceRow, "id" | "created_at" | "updated_at">]?: WorkspaceRow[K] };
        Relationships: [];
      };
      episodes: {
        Row: EpisodeRow;
        Insert: { [K in Exclude<keyof EpisodeRow, "id" | "created_at" | "updated_at">]: EpisodeRow[K] };
        Update: { [K in Exclude<keyof EpisodeRow, "id" | "created_at" | "updated_at">]?: EpisodeRow[K] };
        Relationships: [];
      };
      guests: {
        Row: GuestRow;
        Insert: { [K in Exclude<keyof GuestRow, "id" | "created_at" | "updated_at">]: GuestRow[K] };
        Update: { [K in Exclude<keyof GuestRow, "id" | "created_at" | "updated_at">]?: GuestRow[K] };
        Relationships: [];
      };
      tasks: {
        Row: TaskRow;
        Insert: { [K in Exclude<keyof TaskRow, "id" | "created_at" | "updated_at">]: TaskRow[K] };
        Update: { [K in Exclude<keyof TaskRow, "id" | "created_at" | "updated_at">]?: TaskRow[K] };
        Relationships: [];
      };
      calendar_events: {
        Row: CalendarEventRow;
        Insert: { [K in Exclude<keyof CalendarEventRow, "id" | "created_at" | "updated_at">]: CalendarEventRow[K] };
        Update: { [K in Exclude<keyof CalendarEventRow, "id" | "created_at" | "updated_at">]?: CalendarEventRow[K] };
        Relationships: [];
      };
      roadmap_cards: {
        Row: RoadmapCardRow;
        Insert: { [K in Exclude<keyof RoadmapCardRow, "id" | "created_at" | "updated_at">]: RoadmapCardRow[K] };
        Update: { [K in Exclude<keyof RoadmapCardRow, "id" | "created_at" | "updated_at">]?: RoadmapCardRow[K] };
        Relationships: [];
      };
      social_posts: {
        Row: SocialPostRow;
        Insert: { [K in Exclude<keyof SocialPostRow, "id" | "created_at" | "updated_at">]: SocialPostRow[K] };
        Update: { [K in Exclude<keyof SocialPostRow, "id" | "created_at" | "updated_at">]?: SocialPostRow[K] };
        Relationships: [];
      };
      partners: {
        Row: PartnerRow;
        Insert: { [K in Exclude<keyof PartnerRow, "id" | "created_at" | "updated_at">]: PartnerRow[K] };
        Update: { [K in Exclude<keyof PartnerRow, "id" | "created_at" | "updated_at">]?: PartnerRow[K] };
        Relationships: [];
      };
      library_assets: {
        Row: LibraryAssetRow;
        Insert: { [K in Exclude<keyof LibraryAssetRow, "id" | "created_at">]: LibraryAssetRow[K] };
        Update: { [K in Exclude<keyof LibraryAssetRow, "id" | "created_at">]?: LibraryAssetRow[K] };
        Relationships: [];
      };
      finance_entries: {
        Row: FinanceEntryRow;
        Insert: { [K in Exclude<keyof FinanceEntryRow, "id" | "created_at" | "updated_at">]: FinanceEntryRow[K] };
        Update: { [K in Exclude<keyof FinanceEntryRow, "id" | "created_at" | "updated_at">]?: FinanceEntryRow[K] };
        Relationships: [];
      };
      settings: {
        Row: SettingsRow;
        Insert: { [K in Exclude<keyof SettingsRow, "id" | "updated_at">]: SettingsRow[K] };
        Update: { [K in Exclude<keyof SettingsRow, "id" | "updated_at">]?: SettingsRow[K] };
        Relationships: [];
      };
      api_credentials: {
        Row: ApiCredentialRow;
        Insert: { [K in Exclude<keyof ApiCredentialRow, "id" | "created_at" | "updated_at">]: ApiCredentialRow[K] };
        Update: { [K in Exclude<keyof ApiCredentialRow, "id" | "created_at" | "updated_at">]?: ApiCredentialRow[K] };
        Relationships: [];
      };
      ai_conversations: {
        Row: AIConversationRow;
        Insert: { [K in Exclude<keyof AIConversationRow, "id" | "created_at" | "updated_at">]: AIConversationRow[K] };
        Update: { [K in Exclude<keyof AIConversationRow, "id" | "created_at" | "updated_at">]?: AIConversationRow[K] };
        Relationships: [];
      };
      equipment: {
        Row: EquipmentRow;
        Insert: { [K in Exclude<keyof EquipmentRow, "id" | "created_at" | "updated_at">]: EquipmentRow[K] };
        Update: { [K in Exclude<keyof EquipmentRow, "id" | "created_at" | "updated_at">]?: EquipmentRow[K] };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
