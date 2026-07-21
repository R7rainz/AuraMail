import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Clock,
  Inbox,
  Bell,
  FileText,
  Presentation,
  Wrench,
  ClipboardCheck,
  UserCheck,
  Zap,
  Calendar,
} from "lucide-react";

export interface PlacementEmail {
  id: string;
  gmailMessageId: string;
  threadId?: string;
  subject: string;
  sender: string;
  snippet: string;
  receivedAt: string;
  company: string | null;
  role: string | null;
  deadline: string | null;
  applyLink: string | null;
  otherLinks?: string[] | null;
  eligibility: string | null;
  timings: string | null;
  salary: string | null;
  location: string | null;
  eventDetails?: string | null;
  requirements?: string | null;
  description?: string | null;
  category?: string;
  tags?: string[];
  priority?: string;
  summary?: string;
  attachments?: EmailAttachment[];
  threadMessages?: PlacementEmail[];
  followupCount?: number;
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  attachmentId: string;
  size: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  link?: string;
  isAuraMail: boolean;
}

export type EmailCategory =
  | "all"
  | "internship"
  | "job offer"
  | "ppt"
  | "workshop"
  | "exam"
  | "interview"
  | "result"
  | "reminder"
  | "announcement"
  | "registration";
export type SortOption = "date" | "priority" | "company" | "deadline";
export type SortDirection = "asc" | "desc";

export const sortOptions: { value: SortOption; label: string; icon: LucideIcon }[] = [
  { value: "date", label: "Date Received", icon: Clock },
  { value: "priority", label: "Priority", icon: Zap },
  { value: "company", label: "Company", icon: Building2 },
  { value: "deadline", label: "Deadline", icon: Calendar },
];

// Icon and display label per category; colour comes from the urgency scale.
export const categoryConfig: Record<
  string,
  { icon: LucideIcon; label: string }
> = {
  all: { icon: Inbox, label: "All" },
  internship: {
    icon: Briefcase,
    label: "Internships",
  },
  "job offer": {
    icon: Building2,
    label: "Jobs",
  },
  ppt: { icon: Presentation, label: "PPT" },
  workshop: { icon: Wrench, label: "Workshops" },
  exam: { icon: GraduationCap, label: "Exams" },
  interview: {
    icon: UserCheck,
    label: "Interviews",
  },
  result: {
    icon: ClipboardCheck,
    label: "Results",
  },
  reminder: { icon: Clock, label: "Reminders" },
  announcement: {
    icon: Bell,
    label: "Announcements",
  },
  registration: {
    icon: FileText,
    label: "Registration",
  },
};
