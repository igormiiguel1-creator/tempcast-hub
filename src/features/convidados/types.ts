export type GuestStatus = "Idea" | "Contacted" | "Negotiating" | "Confirmed" | "Recorded" | "Published" | "Cancelled";

export type GuestPriority = "Low" | "Medium" | "High" | "Urgent";

export type Guest = {
  id: number;
  name: string;
  profession: string;
  company: string;
  status: GuestStatus;
  priority: GuestPriority;
  favorite: boolean;
  recordingDate: string;
  publicationDate: string;
  biography: string;
  notes: string;
  email: string;
  phone: string;
  instagram: string;
  linkedin: string;
  website: string;
  contactDate: string;
  confirmationDate: string;
  editingDate: string;
  recentActivity: Array<{ title: string; time: string; detail: string }>;
  expenses: {
    cachet: string;
    hotel: string;
    transport: string;
    meals: string;
    other: string;
  };
  checklist: Array<{ label: string; checked: boolean }>;
  attachments: string[];
  timeline: Array<{ label: string; date: string; note: string }>;
  initials: string;
};
