import type { LucideIcon } from "lucide-react";

export type EpisodeStatus =
  | "Idea"
  | "Contacted"
  | "Confirmed"
  | "Outline"
  | "Scheduled"
  | "Recorded"
  | "Editing"
  | "Shorts"
  | "Published";

export type EpisodePriority = "High" | "Medium" | "Low";

export type CalendarEventType = "Recording" | "Editing" | "Publication" | "Meeting" | "Sponsor" | "Reminder" | "Task";

export type RoadmapStage = "Ideas" | "Contacted" | "Confirmed" | "Recording" | "Editing" | "Scheduled" | "Published" | "Archived";

export type TaskSection = "My Tasks" | "Today" | "This Week" | "Completed" | "Overdue";

export interface ChecklistItem {
  label: string;
  checked: boolean;
}

export interface TimelineItem {
  label: string;
  date: string;
  note: string;
}

export interface ProductionAttachment {
  name: string;
  size: string;
  type: string;
}

export interface ProductionActivity {
  title: string;
  time: string;
  detail: string;
}

export interface Episode {
  id: number;
  title: string;
  guest: string;
  editor: string;
  sponsor: string;
  status: EpisodeStatus;
  recordingDate: string;
  editingDate: string;
  publicationDate: string;
  assignedGuest: string;
  assignedEditor: string;
  priority: EpisodePriority;
  duration: string;
  platformStatus: string;
  overview: string;
  checklist: ChecklistItem[];
  notes: string;
  sponsors: string[];
  files: ProductionAttachment[];
  timeline: TimelineItem[];
  recentActivity: ProductionActivity[];
  attachments: string[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  type: CalendarEventType;
  date: string;
  time: string;
  location: string;
  summary: string;
  accent: string;
}

export interface RoadmapCard {
  id: number;
  title: string;
  stage: RoadmapStage;
  priority: EpisodePriority;
  tags: string[];
  guest: string;
  episode: string;
  dueDate: string;
  progress: number;
  checklistPreview: string[];
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  priority: EpisodePriority;
  assignee: string;
  dueDate: string;
  section: TaskSection;
  episode: string;
  guest: string;
  checklist: ChecklistItem[];
  comments: string[];
  attachments: string[];
  activity: ProductionActivity[];
}

export interface SocialPost {
  id: number;
  platform: string;
  status: string;
  content: string;
  scheduledFor: string;
  audience: string;
  performance: string;
  tags: string[];
}

export interface Partner {
  id: number;
  name: string;
  type: string;
  status: string;
  contractValue: string;
  nextMeeting: string;
  notes: string;
  contact: string;
  renewalDate: string;
}

export interface LibraryAsset {
  id: number;
  title: string;
  type: string;
  category: string;
  size: string;
  updatedAt: string;
  tag: string;
}

export interface ReportItem {
  id: number;
  title: string;
  category: string;
  summary: string;
  format: string;
  trend: string;
}

export interface FinanceEntry {
  id: number;
  title: string;
  type: "Expense" | "Income";
  category: string;
  amount: string;
  date: string;
  note: string;
}

export interface AIPrompt {
  id: number;
  title: string;
  description: string;
  favorite: boolean;
  category: string;
}

export interface IntegrationItem {
  name: string;
  status: string;
  description: string;
}

export interface SummaryCardProps {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
}
