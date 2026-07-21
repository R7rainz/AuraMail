"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/authContext";
import { updateNotificationPreference } from "@/app/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, BellOff, LogOut, Mail, RefreshCw, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { PlacementEmail } from "./types";
import { getDaysDiff } from "./lib/dateUtils";
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
    }
  };

  const calendar = useCalendarEvents(setError);
  const { emails, emailsLoading, syncing, fetchEmails, handleSync } =
    useEmails(setError, calendar.fetchCalendarEvents, notificationsEnabled);
  const filters = useEmailFilters(emails);

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Toaster position="top-right" />

      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Mail className="size-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            AuraMail
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.email}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
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


          <Separator orientation="vertical" className="mx-1 h-4" />

          <span
            className="grid size-7 place-items-center rounded-full bg-accent text-xs font-medium text-accent-foreground"
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

      <div className="relative flex flex-1 overflow-hidden">
        <InboxSidebar
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
          emailsLoading={emailsLoading}
          filteredEmails={filters.filteredEmails}
          selectedEmail={selectedEmail}
          setSelectedEmail={setSelectedEmail}
        />

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedEmail ? (
              <EmailDetailView
                key="detail"
                email={selectedEmail}
                onBack={() => setSelectedEmail(null)}
                inCalendar={calendar.isInCalendar(selectedEmail)}
                addingToCalendar={calendar.addingToCalendar}
                onAddToCalendar={() => calendar.addToCalendar(selectedEmail)}
                onRemoveFromCalendar={() =>
                  calendar.removeFromCalendar(selectedEmail)
                }
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

        <CalendarPanel emails={emails} calendarEvents={calendar.calendarEvents} />
      </div>
    </div>
  );
}
