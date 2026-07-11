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
  important?: boolean;
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

// Refined subtle color mappings using Tailwind semantics
export const categoryConfig: Record<
  string,
  { icon: LucideIcon; label: string; colorClass: string }
> = {
  all: { icon: Inbox, label: "All", colorClass: "text-gray-300" },
  internship: {
    icon: Briefcase,
    label: "Internships",
    colorClass: "text-blue-400",
  },
  "job offer": {
    icon: Building2,
    label: "Jobs",
    colorClass: "text-emerald-400",
  },
  ppt: { icon: Presentation, label: "PPT", colorClass: "text-indigo-400" },
  workshop: { icon: Wrench, label: "Workshops", colorClass: "text-amber-400" },
  exam: { icon: GraduationCap, label: "Exams", colorClass: "text-yellow-400" },
  interview: {
    icon: UserCheck,
    label: "Interviews",
    colorClass: "text-cyan-400",
  },
  result: {
    icon: ClipboardCheck,
    label: "Results",
    colorClass: "text-teal-400",
  },
  reminder: { icon: Clock, label: "Reminders", colorClass: "text-rose-400" },
  announcement: {
    icon: Bell,
    label: "Announcements",
    colorClass: "text-purple-400",
  },
  registration: {
    icon: FileText,
    label: "Registration",
    colorClass: "text-pink-400",
  },
};
