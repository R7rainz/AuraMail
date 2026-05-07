"use client";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/authContext";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Mail,
  LogOut,
  Briefcase,
  Building2,
  GraduationCap,
  Clock,
  ExternalLink,
  X,
  RefreshCw,
  Inbox,
  CalendarPlus,
  ChevronRight,
  Bell,
  MapPin,
  DollarSign,
  FileText,
  User,
  AlertTriangle,
  ChevronLeft,
  Presentation,
  Wrench,
  ClipboardCheck,
  UserCheck,
  Zap,
  Star,
  Calendar,
  Search,
  LayoutDashboard,
  CalendarCheck,
  Sparkles,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- TYPES ---
interface PlacementEmail {
  id: string;
  gmailMessageId: string;
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
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  link?: string;
  isAuraMail: boolean;
}

type EmailCategory =
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
type SortOption = "date" | "priority" | "company" | "deadline";
type SortDirection = "asc" | "desc";

const sortOptions: { value: SortOption; label: string; icon: LucideIcon }[] = [
  { value: "date", label: "Date Received", icon: Clock },
  { value: "priority", label: "Priority", icon: Zap },
  { value: "company", label: "Company", icon: Building2 },
  { value: "deadline", label: "Deadline", icon: Calendar },
];

// Refined subtle color mappings using Tailwind semantics
const categoryConfig: Record<
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

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [emails, setEmails] = useState<PlacementEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<EmailCategory>("all");
  const [selectedEmail, setSelectedEmail] = useState<PlacementEmail | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarEventsMap, setCalendarEventsMap] = useState<
    Record<string, string>
  >({});
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null);

  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const syncingRef = useRef(false);

  // --- DATA FETCHING ---
  const fetchEmails = useCallback(async (silent = false) => {
    if (!silent) setEmailsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch emails");
      const data = await res.json();
      setEmails(data.emails || []);
    } catch (err) {
      if (!silent) setError("Failed to load emails");
    } finally {
      if (!silent) setEmailsLoading(false);
    }
  }, []);

  const fetchCalendarEvents = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/calendar/events?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.events) {
        setCalendarEvents(data.events);
        const map: Record<string, string> = {};
        data.events.forEach((e: CalendarEvent) => {
          if (e.isAuraMail) map[e.title] = e.id;
        });
        setCalendarEventsMap(map);
      }
    } catch {}
  }, []);

  const handleSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/emails/sync`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Sync failed`);
      await fetchEmails(true);
      await fetchCalendarEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync emails.");
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [fetchEmails, fetchCalendarEvents]);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (user) {
      fetchEmails();
      fetchCalendarEvents();
    }
  }, [user, loading, router, fetchEmails, fetchCalendarEvents]);

  // --- UTILS ---
  const getDaysDiff = (date: string): number => {
    const target = new Date(date);
    const now = new Date();
    return Math.floor(
      (Date.UTC(target.getFullYear(), target.getMonth(), target.getDate()) -
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) /
        (1000 * 60 * 60 * 24),
    );
  };

  const formatRelativeDate = (date: string) => {
    const days = -getDaysDiff(date);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDeadline = (date: string) => {
    const days = getDaysDiff(date);
    if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true };
    if (days === 0) return { text: "Today", urgent: true };
    if (days === 1) return { text: "Tomorrow", urgent: true };
    if (days <= 3) return { text: `${days} days`, urgent: true };
    return {
      text: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      urgent: false,
    };
  };

  // --- COMPUTED DATA ---
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: emails.length };
    emails.forEach((e) => {
      const cat = e.category?.toLowerCase() || "announcement";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [emails]);

  const filteredEmails = useMemo(() => {
    const filtered = emails.filter((e) => {
      const matchCat =
        selectedCategory === "all" ||
        e.category?.toLowerCase() === selectedCategory;
      const matchSearch =
        !searchQuery ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.role?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison =
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
          break;
        case "priority":
          comparison =
            ({ high: 3, medium: 2, low: 1 }[b.priority || ""] || 0) -
            ({ high: 3, medium: 2, low: 1 }[a.priority || ""] || 0);
          break;
        case "company":
          comparison = (a.company || a.subject || "").localeCompare(
            b.company || b.subject || "",
          );
          break;
        case "deadline":
          if (!a.deadline && !b.deadline) comparison = 0;
          else if (!a.deadline) comparison = 1;
          else if (!b.deadline) comparison = -1;
          else
            comparison =
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [emails, selectedCategory, searchQuery, sortBy, sortDirection]);

  const upcomingDeadlines = useMemo(
    () =>
      emails
        .filter((e) => e.deadline && getDaysDiff(e.deadline) >= -1)
        .sort((a, b) => getDaysDiff(a.deadline!) - getDaysDiff(b.deadline!))
        .slice(0, 4),
    [emails],
  );
  const highPriorityCount = emails.filter((e) => e.priority === "high").length;

  // ADDED FIX: upcomingEvents properly computed here
  const upcomingEvents = useMemo(() => {
    return calendarEvents
      .filter((e) => {
        const days = getDaysDiff(e.startTime);
        return days >= 0 && days <= 7;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .slice(0, 4);
  }, [calendarEvents]);

  // --- CALENDAR LOGIC ---
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: {
      date: number;
      fullDateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      hasDeadline: boolean;
      hasEvent: boolean;
    }[] = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = startingDay - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      let pM = month - 1,
        pY = year;
      if (pM < 0) {
        pM = 11;
        pY--;
      }
      days.push({
        date: d,
        fullDateStr: `${pY}-${String(pM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        isCurrentMonth: false,
        isToday: false,
        hasDeadline: false,
        hasEvent: false,
      });
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        date: i,
        fullDateStr: dateStr,
        isCurrentMonth: true,
        isToday:
          today.getDate() === i &&
          today.getMonth() === month &&
          today.getFullYear() === year,
        hasDeadline: emails.some((e) => e.deadline?.startsWith(dateStr)),
        hasEvent: calendarEvents.some((e) => e.startTime.startsWith(dateStr)),
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      let nM = month + 1,
        nY = year;
      if (nM > 11) {
        nM = 0;
        nY++;
      }
      days.push({
        date: i,
        fullDateStr: `${nY}-${String(nM + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
        isCurrentMonth: false,
        isToday: false,
        hasDeadline: false,
        hasEvent: false,
      });
    }
    return days;
  };

  const navigateMonth = (dir: number) =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1),
    );

  const getEmailTitle = (email: PlacementEmail) =>
    email.company
      ? `${email.company}${email.role ? ` - ${email.role}` : ""}`
      : email.subject;
  const isInCalendar = (email: PlacementEmail) =>
    !!calendarEventsMap[getEmailTitle(email)] || !!calendarEventsMap[email.id];

  const addToCalendar = async (email: PlacementEmail) => {
    if (!email.deadline || isInCalendar(email)) return;
    setAddingToCalendar(true);
    try {
      const token = localStorage.getItem("accessToken");
      const title = getEmailTitle(email);
      const res = await fetch(`${API_URL}/calendar/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: email.summary || email.snippet,
          startTime: email.deadline.includes("T")
            ? email.deadline
            : `${email.deadline}T10:00:00`,
          location: email.location || "",
          emailId: email.id,
          company: email.company || "",
          role: email.role || "",
          eventType: "deadline",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCalendarEventsMap((prev) => ({
        ...prev,
        [title]: data.eventId,
        [email.id]: data.eventId,
      }));
      fetchCalendarEvents();
    } catch {
      setError("Failed to add to calendar");
    } finally {
      setAddingToCalendar(false);
    }
  };

  const removeFromCalendar = async (email: PlacementEmail) => {
    const eventId =
      calendarEventsMap[getEmailTitle(email)] || calendarEventsMap[email.id];
    if (!eventId) return;
    setAddingToCalendar(true);
    try {
      await fetch(`${API_URL}/calendar/events?eventId=${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setCalendarEventsMap((prev) => {
        const next = { ...prev };
        delete next[getEmailTitle(email)];
        delete next[email.id];
        return next;
      });
      fetchCalendarEvents();
    } catch {
      setError("Failed to remove from calendar");
    } finally {
      setAddingToCalendar(false);
    }
  };

  const activeFocusDate = hoveredDate || selectedCalendarDate;
  const activeDateEvents = useMemo(() => {
    if (!activeFocusDate) return { events: [], deadlines: [] };
    return {
      events: calendarEvents.filter((e) =>
        e.startTime.startsWith(activeFocusDate),
      ),
      deadlines: emails.filter((e) => e.deadline?.startsWith(activeFocusDate)),
    };
  }, [activeFocusDate, calendarEvents, emails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 rounded-full border-t-2 border-l-2 border-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white font-sans selection:bg-blue-500/30">
      {/* HEADER */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-black/50 backdrop-blur-xl z-20 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <Mail className="w-4 h-4 text-gray-300" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              AuraMail
            </span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <span className="text-sm font-medium text-gray-400">Workspace</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white group"
          >
            <RefreshCw
              className={`w-4 h-4 text-blue-400 group-hover:text-blue-300 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync"}
          </button>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-white/10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-200 shadow-inner">
            {user.name?.charAt(0) || "U"}
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ERROR BANNER */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl flex items-center gap-3 border border-rose-500/30 bg-rose-500/10 backdrop-blur-md text-sm text-rose-200 shadow-2xl"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN 3-COLUMN WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* COLUMN 1: INBOX LIST (Fixed Width) */}
        <div className="w-[380px] flex flex-col border-r border-white/10 bg-[#050505] shrink-0 z-10">
          {/* Search & Filters */}
          <div className="p-5 space-y-4 border-b border-white/5 bg-black/40 backdrop-blur-sm">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-gray-600 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.07]"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className={`h-full px-3 rounded-xl border transition-all flex items-center justify-center ${showSortDropdown ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"}`}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#121212] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${sortBy === opt.value ? "bg-blue-500/10 text-blue-400" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                      >
                        {opt.label}
                        {sortBy === opt.value && (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {Object.entries(categoryConfig)
                .filter(
                  ([key]) => key === "all" || (categoryCounts[key] || 0) > 0,
                )
                .map(([key, config]) => {
                  const isActive = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key as EmailCategory)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${isActive ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"}`}
                    >
                      {config.label}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Email Feed */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {emailsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-t-2 border-l-2 border-blue-500 animate-spin" />
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Inbox className="w-10 h-10 mx-auto mb-4 opacity-20 text-gray-400" />
                <p className="text-sm text-gray-500">
                  No emails match your criteria.
                </p>
              </div>
            ) : (
              filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const cat =
                  categoryConfig[
                    email.category?.toLowerCase() || "announcement"
                  ] || categoryConfig.announcement;
                return (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${isSelected ? "bg-white/10 border-white/20 shadow-lg" : "bg-transparent border-transparent hover:bg-white/[0.04]"}`}
                  >
                    <div className="flex justify-between items-start mb-1.5 gap-3">
                      <span
                        className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-gray-200"}`}
                      >
                        {email.company || email.subject}
                      </span>
                      <span
                        className={`text-[10px] shrink-0 whitespace-nowrap mt-0.5 ${isSelected ? "text-blue-300" : "text-gray-500"}`}
                      >
                        {formatRelativeDate(email.receivedAt)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate mb-3 ${isSelected ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {email.role || email.snippet}
                    </p>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {email.priority === "high" && (
                        <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-500/10 px-1.5 py-0.5 rounded">
                          <Zap className="w-3 h-3" /> High
                        </div>
                      )}
                      {email.deadline && (
                        <div
                          className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${formatDeadline(email.deadline).urgent ? "text-amber-400 bg-amber-500/10" : "text-blue-400 bg-blue-500/10"}`}
                        >
                          <Clock className="w-3 h-3" />{" "}
                          {formatDeadline(email.deadline).text}
                        </div>
                      )}
                      {!email.deadline && !email.priority && (
                        <div
                          className={`flex items-center gap-1 text-[10px] font-medium ${cat.colorClass}`}
                        >
                          <cat.icon className="w-3 h-3" /> {cat.label}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: CENTER WORKSPACE */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-black overflow-hidden">
          {/* Subtle animated background (mimicking hero) */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid-center"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-center)" />
            </svg>
          </div>

          <AnimatePresence mode="wait">
            {selectedEmail ? (
              // --- DETAIL VIEW ---
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar z-10"
              >
                {/* Header Actions */}
                <div className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5">
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
                    Back
                  </button>
                  <div className="flex gap-3">
                    {selectedEmail.applyLink && (
                      <a
                        href={selectedEmail.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      >
                        Apply Now <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedEmail.deadline &&
                      (isInCalendar(selectedEmail) ? (
                        <button
                          onClick={() => removeFromCalendar(selectedEmail)}
                          disabled={addingToCalendar}
                          className="px-4 py-2 bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <CalendarCheck className="w-4 h-4" /> Added to
                          Calendar
                        </button>
                      ) : (
                        <button
                          onClick={() => addToCalendar(selectedEmail)}
                          disabled={addingToCalendar}
                          className="px-4 py-2 bg-white/5 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <CalendarPlus className="w-4 h-4" /> Add Event
                        </button>
                      ))}
                  </div>
                </div>

                <div className="p-10 max-w-4xl mx-auto space-y-10">
                  {/* Hero Block */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/5 border border-white/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      <span className="text-xs text-gray-300 font-medium tracking-wide uppercase">
                        {selectedEmail.category || "Announcement"}
                      </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-400 leading-tight mb-4 tracking-tight">
                      {selectedEmail.company || selectedEmail.subject}
                    </h1>
                    {selectedEmail.role && selectedEmail.company && (
                      <p className="text-xl text-blue-400 font-medium mb-6">
                        {selectedEmail.role}
                      </p>
                    )}

                    {selectedEmail.tags && selectedEmail.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs font-medium rounded bg-white/5 border border-white/10 text-gray-300 backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Summary */}
                  {selectedEmail.summary && (
                    <div className="p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 relative overflow-hidden backdrop-blur-md">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-blue-500" />
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">
                          AI Intelligent Summary
                        </h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed text-[15px]">
                        {selectedEmail.summary}
                      </p>
                    </div>
                  )}

                  {/* Quick Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedEmail.deadline && (
                      <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />{" "}
                          Deadline
                        </p>
                        <p className="text-[15px] text-white font-medium">
                          {new Date(selectedEmail.deadline).toLocaleString([], {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    )}
                    {selectedEmail.salary && (
                      <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />{" "}
                          Compensation
                        </p>
                        <p className="text-[15px] text-white font-medium">
                          {typeof selectedEmail.salary === "string"
                            ? selectedEmail.salary
                            : JSON.stringify(selectedEmail.salary)}
                        </p>
                      </div>
                    )}
                    {selectedEmail.location && (
                      <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-400" />{" "}
                          Location
                        </p>
                        <p className="text-[15px] text-white font-medium">
                          {typeof selectedEmail.location === "string"
                            ? selectedEmail.location
                            : JSON.stringify(selectedEmail.location)}
                        </p>
                      </div>
                    )}
                    {selectedEmail.timings && (
                      <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />{" "}
                          Timings
                        </p>
                        <p className="text-[15px] text-white font-medium">
                          {typeof selectedEmail.timings === "string"
                            ? selectedEmail.timings
                            : JSON.stringify(selectedEmail.timings)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="space-y-10 pt-4 border-t border-white/10">
                    {selectedEmail.eligibility && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                          <User className="w-4 h-4" /> Eligibility Criteria
                        </h3>
                        <div className="text-[15px] text-gray-300 leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-white/10">
                          {typeof selectedEmail.eligibility === "string"
                            ? selectedEmail.eligibility
                            : JSON.stringify(selectedEmail.eligibility)}
                        </div>
                      </div>
                    )}
                    {selectedEmail.requirements && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4" /> Requirements
                        </h3>
                        <div className="text-[15px] text-gray-300 leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-white/10">
                          {typeof selectedEmail.requirements === "string"
                            ? selectedEmail.requirements
                            : JSON.stringify(selectedEmail.requirements)}
                        </div>
                      </div>
                    )}
                    {selectedEmail.description && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Full Description
                        </h3>
                        <div className="text-[15px] text-gray-400 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-6 rounded-xl border border-white/5">
                          {selectedEmail.description}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pb-20"></div>
                </div>
              </motion.div>
            ) : (
              // --- DASHBOARD OVERVIEW ---
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 overflow-y-auto custom-scrollbar p-10 z-10 flex flex-col items-center justify-center min-h-full"
              >
                <div className="max-w-4xl w-full text-center space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mx-auto">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-sm text-gray-400">
                      Workspace Active
                    </span>
                  </div>

                  <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                    Welcome back, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500">
                      {user.name?.split(" ")[0]}
                    </span>
                  </h1>

                  <p className="text-lg text-gray-400 max-w-xl mx-auto">
                    You have{" "}
                    <span className="text-rose-400 font-semibold">
                      {highPriorityCount} urgent
                    </span>{" "}
                    updates and{" "}
                    <span className="text-amber-400 font-semibold">
                      {upcomingDeadlines.length} deadlines
                    </span>{" "}
                    approaching.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                    {[
                      {
                        label: "Total Emails",
                        value: emails.length,
                        text: "text-white",
                      },
                      {
                        label: "Active Deadlines",
                        value: upcomingDeadlines.length,
                        text: "text-amber-400",
                      },
                      {
                        label: "High Priority",
                        value: highPriorityCount,
                        text: "text-rose-400",
                      },
                      {
                        label: "Synced",
                        value: "Just now",
                        text: "text-blue-400",
                        isString: true,
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
                      >
                        <div className={`text-3xl font-bold mb-2 ${s.text}`}>
                          {s.value}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COLUMN 3: RIGHT CALENDAR PANEL */}
        <div className="w-[340px] border-l border-white/10 bg-[#050505] flex flex-col shrink-0 z-20">
          {/* Calendar Header */}
          <div className="p-6 border-b border-white/5 bg-black/40 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="w-7 h-7 rounded hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-bold text-gray-600"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {getCalendarDays().map((day, i) => {
                const isActiveVisual =
                  hoveredDate === day.fullDateStr ||
                  selectedCalendarDate === day.fullDateStr;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredDate(day.fullDateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() =>
                      setSelectedCalendarDate(
                        selectedCalendarDate === day.fullDateStr
                          ? null
                          : day.fullDateStr,
                      )
                    }
                    className={`aspect-square flex items-center justify-center text-xs rounded-lg relative cursor-pointer transition-all duration-300 ease-out
                      ${isActiveVisual ? "scale-[1.15] z-10 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "border border-transparent hover:bg-white/5"}
                      ${day.isToday && !isActiveVisual ? "bg-white/10 border-white/20 text-white font-bold" : ""}
                      ${!day.isCurrentMonth && !isActiveVisual ? "text-gray-700" : !isActiveVisual && !day.isToday ? "text-gray-400" : ""}
                    `}
                  >
                    {day.date}
                    {/* Event Dots */}
                    {(day.hasDeadline || day.hasEvent) && !isActiveVisual && (
                      <div className="absolute bottom-1.5 flex gap-1">
                        {day.hasDeadline && (
                          <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                        )}
                        {day.hasEvent && (
                          <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Feed underneath */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-transparent">
            <AnimatePresence mode="wait">
              {activeFocusDate ? (
                <motion.div
                  key="focus"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                    <h3 className="text-sm font-semibold text-white">
                      {new Date(activeFocusDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    {selectedCalendarDate && (
                      <span className="text-[10px] font-medium tracking-wide uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                        Locked
                      </span>
                    )}
                  </div>

                  {activeDateEvents.events.length === 0 &&
                  activeDateEvents.deadlines.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-6">
                      No scheduled items.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {activeDateEvents.deadlines.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-amber-500 font-bold mb-3 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Deadlines
                          </p>
                          <div className="space-y-2">
                            {activeDateEvents.deadlines.map((dl) => (
                              <div
                                key={dl.id}
                                className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]"
                              >
                                <p className="text-sm font-semibold text-white truncate">
                                  {dl.company || dl.subject}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {dl.role}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeDateEvents.events.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-3 flex items-center gap-1.5">
                            <CalendarCheck className="w-3.5 h-3.5" /> Events
                          </p>
                          <div className="space-y-2">
                            {activeDateEvents.events.map((ev) => (
                              <div
                                key={ev.id}
                                className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02]"
                              >
                                <p className="text-sm font-semibold text-white truncate">
                                  {ev.title}
                                </p>
                                <p className="text-xs text-blue-300 mt-1 font-medium">
                                  {new Date(ev.startTime).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="general"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-5 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Next 7 Days
                  </h3>
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-gray-600">
                        Your schedule is clear.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => {
                        const eventDate = new Date(event.startTime);
                        return (
                          <div
                            key={event.id}
                            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-default"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-gray-300 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors">
                                <span className="text-[10px] font-medium leading-none mb-1 uppercase tracking-wider">
                                  {eventDate.toLocaleDateString("en-US", {
                                    month: "short",
                                  })}
                                </span>
                                <span className="text-sm font-bold leading-none">
                                  {eventDate.getDate()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">
                                  {event.title}
                                </p>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  {eventDate.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Global CSS for transparent modern scrollbars */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.2); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}
