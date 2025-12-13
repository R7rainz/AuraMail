"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/authContext";
import {
  Mail,
  Search,
  Bell,
  LogOut,
  Briefcase,
  Building2,
  GraduationCap,
  Clock,
  LinkIcon,
  X,
  RefreshCw,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = "http://localhost:5000";

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
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }> | null;
  eligibility: string | null;
  timings: string | null;
  salary: string | null;
  location: string | null;
  eventDetails?: string | null;
  requirements?: string | null;
  description?: string | null;
  attachmentSummary?: string | null;
  category?: string;
  summary?: string;
}

type EmailCategory =
  | "all"
  | "internship"
  | "job offer"
  | "exam"
  | "announcement"
  | "reminder";

const categoryConfig: Record<
  EmailCategory,
  { icon: any; label: string; color: string; bgColor: string }
> = {
  all: {
    icon: Mail,
    label: "All Mail",
    color: "text-foreground",
    bgColor: "bg-white/5",
  },
  internship: {
    icon: Briefcase,
    label: "Internships",
    color: "text-foreground",
    bgColor: "bg-white/5",
  },
  "job offer": {
    icon: Building2,
    label: "Job Offers",
    color: "text-foreground",
    bgColor: "bg-white/5",
  },
  exam: {
    icon: GraduationCap,
    label: "Exams",
    color: "text-foreground",
    bgColor: "bg-white/5",
  },
  announcement: {
    icon: Bell,
    label: "Announcements",
    color: "text-foreground",
    bgColor: "bg-white/5",
  },
  reminder: {
    icon: Clock,
    label: "Reminders",
    color: "text-foreground",
    bgColor: "bg-white/5",
  },
};

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [emails, setEmails] = useState<PlacementEmail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<EmailCategory>("all");
  const [selectedEmail, setSelectedEmail] = useState<PlacementEmail | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, page: 1, totalPages: 1 });
  const [error, setError] = useState<string | null>(null);
  const [autoSyncDone, setAutoSyncDone] = useState(false);
  const syncingRef = useRef(false);

  const fetchEmails = useCallback(async (silent = false) => {
    if (!silent) setEmailsLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/api/emails`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch emails");

      const data = await response.json();
      setEmails(data.emails);
      setStats({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error("Error fetching emails:", err);
      if (!silent) setError("Failed to load emails");
    } finally {
      if (!silent) setEmailsLoading(false);
    }
  }, []);

  const handleSync = useCallback(
    async (silent = false) => {
      if (syncingRef.current) return;

      syncingRef.current = true;
      setSyncing(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`${API_URL}/api/emails/sync`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to sync emails");
        }

        await fetchEmails(true);
      } catch (err) {
        console.error("Error syncing emails:", err);
        if (!silent)
          setError(
            err instanceof Error ? err.message : "Failed to sync emails"
          );
      } finally {
        syncingRef.current = false;
        setSyncing(false);
      }
    },
    [fetchEmails]
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    if (user && !autoSyncDone) {
      fetchEmails();
      const timeoutId = setTimeout(() => {
        handleSync(true);
        setAutoSyncDone(true);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [user, loading, router, autoSyncDone]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getCategoryCounts = () => {
    const counts: Record<EmailCategory, number> = {
      all: emails.length,
      internship: 0,
      "job offer": 0,
      exam: 0,
      announcement: 0,
      reminder: 0,
    };

    emails.forEach((email) => {
      const category = (email.category?.toLowerCase() ||
        "announcement") as EmailCategory;
      if (counts[category] !== undefined) {
        counts[category]++;
      }
    });

    return counts;
  };

  const filteredEmails = emails
    .filter((email) => {
      const matchesCategory =
        selectedCategory === "all" ||
        email.category?.toLowerCase() === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.role?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );

  const categoryCounts = getCategoryCounts();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
          <p className="text-white/60 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-all duration-300">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">
                AuraMail
              </h1>
              <p className="text-xs text-white/40">Manage your opportunities</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncing && (
              <div className="flex items-center gap-2 text-xs text-white/60 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Syncing</span>
              </div>
            )}
            <Button
              onClick={() => handleSync(false)}
              disabled={syncing}
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-white/10 transition-all duration-300"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-9 w-9 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-white/10">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="text-xs bg-white/10 text-white font-semibold">
                      {user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-black/90 backdrop-blur-xl border-white/10"
                align="end"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-white/50">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-white/10 focus:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex gap-6 p-6 lg:p-8">
        <div className="w-56 flex flex-col gap-4 shrink-0">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-white/60 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all duration-300 ease-out backdrop-blur-sm"
            />
          </div>

          {/* Categories */}
          <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.07] hover:border-white/20">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider px-2 mb-3">
              Categories
            </p>
            <div className="space-y-1">
              {(
                Object.entries(categoryConfig) as [
                  EmailCategory,
                  (typeof categoryConfig)[EmailCategory]
                ][]
              ).map(([category, config]) => {
                const count = categoryCounts[category];
                const Icon = config.icon;
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-out text-sm font-medium group relative overflow-hidden",
                      isSelected
                        ? "bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5"
                        : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform duration-300",
                        isSelected && "scale-110"
                      )}
                    />
                    <span className="flex-1 text-left">{config.label}</span>
                    {count > 0 && (
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300",
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-white/10 text-white/60"
                        )}
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.07] hover:border-white/20">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider px-2 mb-3">
              Overview
            </p>
            <div className="space-y-3 text-sm px-2">
              <div className="flex justify-between items-center group">
                <span className="text-white/60 group-hover:text-white/80 transition-colors">
                  Total Emails
                </span>
                <span className="font-semibold text-white tabular-nums">
                  {stats.total}
                </span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center group">
                <span className="text-white/60 group-hover:text-white/80 transition-colors">
                  Viewing
                </span>
                <span className="font-semibold text-white tabular-nums">
                  {filteredEmails.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-w-0">
          {/* Email List */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">
                {categoryConfig[selectedCategory].label}
              </h2>
              <p className="text-sm text-white/50 mt-1">
                {filteredEmails.length}{" "}
                {filteredEmails.length === 1 ? "email" : "emails"}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <ScrollArea className="flex-1 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20">
              {emailsLoading ? (
                <div className="flex justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div>
                    <p className="text-sm text-white/60 animate-pulse">
                      Loading emails...
                    </p>
                  </div>
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <Archive className="h-12 w-12 text-white/20 mb-4" />
                  <p className="text-base font-medium text-white/60 mb-2">
                    No emails
                  </p>
                  <p className="text-sm text-white/40 mb-6">
                    {selectedCategory === "all"
                      ? "Sync to fetch emails"
                      : "Try another category"}
                  </p>
                  {selectedCategory === "all" && !syncing && (
                    <Button
                      onClick={() => handleSync(false)}
                      size="sm"
                      className="gap-2 bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Sync Emails
                    </Button>
                  )}
                </div>
              ) : (
                <EmailList
                  emails={filteredEmails}
                  selectedEmail={selectedEmail}
                  onSelectEmail={setSelectedEmail}
                />
              )}
            </ScrollArea>
          </div>

          {/* Email Detail Panel */}
          {selectedEmail && (
            <div className="w-96 flex flex-col border border-white/10 rounded-xl bg-white/5 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-right-5 duration-500">
              <EmailDetailPanel
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailList({
  emails,
  selectedEmail,
  onSelectEmail,
}: {
  emails: PlacementEmail[];
  selectedEmail: PlacementEmail | null;
  onSelectEmail: (email: PlacementEmail) => void;
}) {
  return (
    <div className="divide-y divide-white/5">
      {emails.map((email) => (
        <button
          key={email.id}
          onClick={() => onSelectEmail(email)}
          className={cn(
            "w-full text-left px-6 py-4 transition-all duration-300 ease-out border-l-2 relative group",
            selectedEmail?.id === email.id
              ? "bg-white/10 border-l-white shadow-lg shadow-white/5"
              : "hover:bg-white/5 border-l-transparent hover:border-l-white/30"
          )}
        >
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-white transition-colors">
                  {email.subject}
                </h3>
              </div>
              <span className="text-xs text-white/40 shrink-0 whitespace-nowrap tabular-nums">
                {new Date(email.receivedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Company & Role */}
            {(email.company || email.role) && (
              <div className="flex gap-2 text-xs">
                {email.company && (
                  <span className="font-medium text-white/80 group-hover:text-white transition-colors">
                    {email.company}
                  </span>
                )}
                {email.role && (
                  <>
                    <span className="text-white/30">•</span>
                    <span className="text-white/60 group-hover:text-white/80 transition-colors">
                      {email.role}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Snippet */}
            <p className="text-sm text-white/50 line-clamp-2 group-hover:text-white/70 transition-colors">
              {email.summary || email.snippet}
            </p>

            {/* Footer Info */}
            {(email.deadline ||
              (email.attachments && email.attachments.length > 0)) && (
              <div className="flex items-center gap-4 flex-wrap pt-2 text-xs text-white/40">
                {email.deadline && (
                  <div className="flex items-center gap-1.5 group-hover:text-white/60 transition-colors">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="tabular-nums">
                      Due{" "}
                      {new Date(email.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {email.attachments && email.attachments.length > 0 && (
                  <div className="flex items-center gap-1.5 group-hover:text-white/60 transition-colors">
                    <LinkIcon className="h-3.5 w-3.5" />
                    <span>
                      {email.attachments.length} attachment
                      {email.attachments.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedEmail?.id === email.id && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
          )}
        </button>
      ))}
    </div>
  );
}

function EmailDetailPanel({
  email,
  onClose,
}: {
  email: PlacementEmail;
  onClose: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-white/10 bg-white/5">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-white mb-2 pr-8">
            {email.subject}
          </h2>
          <p className="text-sm text-white/50">{email.sender}</p>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-lg hover:bg-white/10 transition-all duration-300"
        >
          <X className="h-4 w-4 text-white/60" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Company & Role */}
          {(email.company || email.role) && (
            <div className="space-y-2">
              {email.company && (
                <div>
                  <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">
                    Company
                  </p>
                  <p className="text-sm font-medium text-white">
                    {email.company}
                  </p>
                </div>
              )}
              {email.role && (
                <div>
                  <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm font-medium text-white">{email.role}</p>
                </div>
              )}
            </div>
          )}

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {email.deadline && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">
                  Deadline
                </p>
                <p className="text-sm font-medium text-white tabular-nums">
                  {new Date(email.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {email.location && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">
                  Location
                </p>
                <p className="text-sm font-medium text-white">
                  {email.location}
                </p>
              </div>
            )}
            {email.salary && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">
                  Salary
                </p>
                <p className="text-sm font-medium text-white">{email.salary}</p>
              </div>
            )}
            {email.timings && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                <p className="text-xs text-white/50 mb-1 uppercase tracking-wider">
                  Timings
                </p>
                <p className="text-sm font-medium text-white">
                  {email.timings}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {(email.description || email.summary) && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                Description
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {email.description || email.summary}
              </p>
            </div>
          )}

          {/* Eligibility */}
          {email.eligibility && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                Eligibility
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {email.eligibility}
              </p>
            </div>
          )}

          {/* Requirements */}
          {email.requirements && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                Requirements
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {email.requirements}
              </p>
            </div>
          )}

          {/* Event Details */}
          {email.eventDetails && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                Event Details
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {email.eventDetails}
              </p>
            </div>
          )}

          {/* Links */}
          {email.applyLink && (
            <div>
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                Apply Link
              </p>
              <a
                href={email.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black hover:bg-white/90 transition-all duration-300 text-sm font-medium group"
              >
                <span>Apply Now</span>
                <LinkIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}

          {/* Other Links */}
          {email.otherLinks && email.otherLinks.length > 1 && (
            <div>
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                Additional Links
              </p>
              <div className="space-y-2">
                {email.otherLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-sm text-white/70 hover:text-white group"
                  >
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate flex-1">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div>
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                Attachments ({email.attachments.length})
              </p>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {attachment.filename}
                      </p>
                      <p className="text-xs text-white/40">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {email.attachmentSummary && (
                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/70">
                    {email.attachmentSummary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Full Email Content */}
          {email.snippet && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">
                Email Snippet
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                {email.snippet}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 tabular-nums">
              Received{" "}
              {new Date(email.receivedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
