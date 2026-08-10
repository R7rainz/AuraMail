"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/authContext";
import { updateNotificationPreference } from "@/app/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, BellOff, LogOut, Mail, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { PlacementEmail } from "./types";
import { getDaysDiff } from "./lib/dateUtils";
import { groupEmailThreads } from "./lib/emailThreads";
import { useEmails } from "./hooks/useEmails";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useEmailFilters } from "./hooks/useEmailFilters";
import { InboxSidebar } from "./components/InboxSidebar";
import { EmailDetailView } from "./components/EmailDetailView";
import { DashboardOverview } from "./components/DashboardOverview";
import { CalendarPanel } from "./components/CalendarPanel";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<PlacementEmail | null>(
    null,
  );
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [syncedUserID, setSyncedUserID] = useState<string | null>(null);

  // Sync local toggle state from the loaded user once, the first time the
  // user becomes available (not via an effect, to avoid an extra render).
  if (user && user.id !== syncedUserID) {
    setSyncedUserID(user.id);
    setNotificationsEnabled(user.notificationsEnabled ?? true);
  }

  const toggleNotifications = async () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    const ok = await updateNotificationPreference(next);
    if (!ok) {
      setNotificationsEnabled(!next);
      setError("Notification preference didn't save. Try again.");
    } else {
      toast.success(next ? "Deadline reminders turned on" : "Deadline reminders turned off");
    }
  };

  const calendar = useCalendarEvents(setError);
  const { emails, emailsLoading, syncing, fetchEmails, handleSync, toggleImportant } =
    useEmails(setError, calendar.fetchCalendarEvents, notificationsEnabled);
  const filters = useEmailFilters(emails);
  const liveSelectedEmail = useMemo(() => {
    if (!selectedEmail) return null;
    return (
      groupEmailThreads(emails).find(
        (email) =>
          (selectedEmail.threadId && email.threadId === selectedEmail.threadId) ||
          email.id === selectedEmail.id,
      ) || selectedEmail
    );
  }, [emails, selectedEmail]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
      return;
    }

    if (!user) return;

    const timeoutID = window.setTimeout(() => {
      void fetchEmails();
      void calendar.fetchCalendarEvents();
    }, 0);

    return () => window.clearTimeout(timeoutID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, router]);

  const upcomingDeadlinesCount = useMemo(
    () => emails.filter((e) => e.deadline && getDaysDiff(e.deadline) >= -1).length,
    [emails],
  );
  const highPriorityCount = emails.filter((e) => e.priority === "high").length;

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="dashboard-shell flex h-dvh min-w-0 flex-col overflow-hidden">
      <Toaster position="top-right" />

      <header className="z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#111617]/75 px-5 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#9e6942] text-primary-foreground shadow-lg shadow-primary/10">
            <Mail className="size-4" />
          </span>
          <span className="text-lg font-medium tracking-tight">
            AuraMail
          </span>
          <Separator orientation="vertical" className="mx-2 h-5 bg-white/10" />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Placement inbox
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="h-10 px-4"
          >
            <RefreshCw className={cn(syncing && "animate-spin")} />
            {syncing ? "Syncing" : "Sync"}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleNotifications}
            aria-label={
              notificationsEnabled
                ? "Turn off deadline notifications"
                : "Turn on deadline notifications"
            }
          >
            {notificationsEnabled ? (
              <Bell />
            ) : (
              <BellOff className="text-muted-foreground" />
            )}
          </Button>


          <Separator orientation="vertical" className="mx-2 h-5" />

          <span
            className="grid size-9 place-items-center rounded-full border border-primary/30 bg-primary/15 text-xs font-medium text-primary"
            aria-hidden="true"
          >
            {user.name?.charAt(0).toUpperCase() || "U"}
          </span>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              logout();
              router.push("/");
            }}
            aria-label="Sign out"
          >
            <LogOut />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="alert"
            className="absolute top-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive shadow-lg backdrop-blur-md"
          >
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss"
              className="rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <InboxSidebar
          className={liveSelectedEmail ? "hidden md:flex" : undefined}
          searchQuery={filters.searchQuery}
          setSearchQuery={filters.setSearchQuery}
          showSortDropdown={showSortDropdown}
          setShowSortDropdown={setShowSortDropdown}
          sortBy={filters.sortBy}
          setSortBy={filters.setSortBy}
          sortDirection={filters.sortDirection}
          setSortDirection={filters.setSortDirection}
          selectedCategory={filters.selectedCategory}
          setSelectedCategory={filters.setSelectedCategory}
          categoryCounts={filters.categoryCounts}
          showImportantOnly={filters.showImportantOnly}
          setShowImportantOnly={filters.setShowImportantOnly}
          importantCount={filters.importantCount}
          onToggleImportant={toggleImportant}
          emailsLoading={emailsLoading}
          filteredEmails={filters.filteredEmails}
          selectedEmail={liveSelectedEmail}
          setSelectedEmail={setSelectedEmail}
        />

        <main
          className={cn(
            "relative min-w-0 flex-1 flex-col overflow-hidden",
            liveSelectedEmail ? "flex" : "hidden md:flex",
          )}
        >
          <AnimatePresence mode="wait">
            {liveSelectedEmail ? (
              <EmailDetailView
                key={`detail-${liveSelectedEmail.id}`}
                email={liveSelectedEmail}
                onBack={() => setSelectedEmail(null)}
                inCalendar={calendar.isInCalendar(liveSelectedEmail)}
                addingToCalendar={calendar.addingToCalendar}
                onAddToCalendar={() => calendar.addToCalendar(liveSelectedEmail)}
                onRemoveFromCalendar={() =>
                  calendar.removeFromCalendar(liveSelectedEmail)
                }
                onToggleImportant={() => toggleImportant(liveSelectedEmail)}
              />
            ) : (
              <DashboardOverview
                key="overview"
                userFirstName={user.name?.split(" ")[0] || ""}
                totalEmails={emails.length}
                highPriorityCount={highPriorityCount}
                upcomingDeadlinesCount={upcomingDeadlinesCount}
              />
            )}
          </AnimatePresence>
        </main>

        <CalendarPanel
          emails={emails}
          calendarEvents={calendar.calendarEvents}
          onRemoveEvent={calendar.removeEventById}
        />
      </div>
    </div>
  );
}
